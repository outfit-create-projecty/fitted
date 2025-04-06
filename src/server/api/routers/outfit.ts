import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clothingItems, outfits, outfitFeedback } from "~/server/db/schema";
import OpenAI from "openai";
import { env } from "~/env";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const prompt = "You are a fashion expert. I have a client that is trying to create an outfit for their specific prompt. Please return a list of stylistic tags in JSON formatthat describe the outfit. Please respond in the following format: { tags: string[] }";
export const outfitRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const allOutfits = await ctx.db.query.outfits.findMany({
        where: eq(outfits.userId, input.userId),
        with: {
          top: true,
          bottom: true,
          shoes: true,
        },
      });

      return allOutfits;
    }),

  create: protectedProcedure
    .input(
      z.object({
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { description } = input;

      // Get all available clothing items
      const items = await ctx.db.query.clothingItems.findMany({
        where: and(
          eq(clothingItems.userId, ctx.session.user.id),
          eq(clothingItems.status, "available")
        ),
      });

      // Check if we have enough items of each type
      const availableTops = items.filter(item => item.classification === "top");
      const availableBottoms = items.filter(item => item.classification === "bottom");
      const availableShoes = items.filter(item => item.classification === "shoes");
      const availableMisc = items.filter(item => item.classification === "misc");

      if (availableTops.length === 0 || availableBottoms.length === 0 || availableShoes.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough available items to create an outfit. Please mark some items as available or add more items to your wardrobe.",
        });
      }

      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const outfit = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: description },
        ],
        response_format: { type: "json_object" },
      });

      const { tags } = JSON.parse(outfit.choices[0]?.message?.content ?? "{}");
      if(!tags) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No tags found" });
      }

      const tagsEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: tags.join(", "),
      });
      const tagsEmbeddingArray = tagsEmbedding.data[0]?.embedding ?? [];
      if(tagsEmbeddingArray.length === 0) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No tags embedding found" });
      }

      const outfitItems = items.map((item) => {
        const score = cosineSimilarity(item.tagsVector, tagsEmbeddingArray);
        return {
          item,
          score,
        };
      });

      const sortedOutfitItems = outfitItems.sort((a, b) => b.score - a.score);
      const top = sortedOutfitItems.find((item) => item.item.classification === "top");
      const bottom = sortedOutfitItems.find((item) => item.item.classification === "bottom");
      const shoes = sortedOutfitItems.find((item) => item.item.classification === "shoes");
      
      if(!top || !bottom || !shoes) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No outfit items found" });
      }

      const avg = (top.score + bottom.score + shoes.score) / 3;
      const misc =  sortedOutfitItems.filter((item) => item.item.classification === "misc" && item.score > avg).slice(0, 3);

      const score = (top.score + bottom.score + shoes.score) / (3 + misc.length);

      const createdOutfit = {
        top: top.item,
        bottom: bottom.item,
        shoes: shoes.item,
        misc: misc.map((item) => item.item),
      };

      const outfitDescription = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are a fashion expert. Given an outfit description and its pieces, create a name and detailed description for the outfit. Respond in JSON format with: { name: string, description: string }"
          },
          {
            role: "user",
            content: `Create a name and description for this outfit. Prompt: ${description}. Pieces: ${[
              createdOutfit.top?.description,
              createdOutfit.bottom?.description,
              createdOutfit.shoes?.description,
              createdOutfit.misc?.map((item) => item.description).join(", ")
            ].filter(Boolean).join(", ")}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const { name, description: outfitDescriptionDescription } = JSON.parse(outfitDescription.choices[0]?.message?.content ?? "{}");
      if (!name || !outfitDescriptionDescription) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate outfit name/description" });
      }

      const insertedOutfit = await ctx.db.insert(outfits).values({
        name,
        description: outfitDescriptionDescription,
        topId: top.item.id,
        bottomId: bottom.item.id,
        shoesId: shoes.item.id,
        miscIds: misc.map((item) => item.item.id),
        userId: ctx.session.user.id,
        prompt: description,
        score: score.toString(),
      }).returning();

      if(!insertedOutfit[0]) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create outfit" });
      }

      return {
        id: insertedOutfit[0].id,
        name,
        description: outfitDescriptionDescription,
        top: top.item,
        bottom: bottom.item,
        shoes: shoes.item,
        misc: misc.map((item) => item.item),
        prompt: description,
        score: score.toString(),
      };
    }),

  addFeedback: protectedProcedure
    .input(z.object({ 
      outfitId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const feedback = await ctx.db.insert(outfitFeedback).values({
        outfitId: input.outfitId,
        userId: ctx.session.user.id,
        rating: input.rating,
        comment: input.comment,
      }).returning();

      return feedback[0];
    }),

  getFeedback: protectedProcedure
    .input(z.object({ outfitId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const feedback = await ctx.db.query.outfitFeedback.findMany({
        where: eq(outfitFeedback.outfitId, input.outfitId),
        orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
      });

      return feedback;
    }),
}); 