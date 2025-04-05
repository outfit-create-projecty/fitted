import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clothingItems, outfits } from "~/server/db/schema";
import OpenAI from "openai";
import { env } from "~/env";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const prompt = "You are a fashion expert. I have a client that is trying to create an outfit for their specific prompt. Please return a list of stylistic tags in JSON formatthat describe the outfit. Please respond in the following format: { tags: string[] }";
export const outfitRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const outfit = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: input.prompt },
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

      const items = await ctx.db.query.clothingItems.findMany({
        where: eq(clothingItems.userId, ctx.session.user.id)
      });

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
      const misc =  sortedOutfitItems.find((item) => item.item.classification !== "top" && item.item.classification !== "bottom");
      
      if(!top || !bottom || !misc) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No outfit items found" });
      }

      const createdOutfit = {
        top: top.item,
        bottom: bottom.item,
        misc: misc.item,
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
            content: `Create a name and description for this outfit. Prompt: ${input.prompt}. Pieces: ${[
              createdOutfit.top?.description,
              createdOutfit.bottom?.description, 
              createdOutfit.misc?.description
            ].filter(Boolean).join(", ")}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const { name, description } = JSON.parse(outfitDescription.choices[0]?.message?.content ?? "{}");
      if (!name || !description) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate outfit name/description" });
      }

      const insertedOutfit = await ctx.db.insert(outfits).values({
        name,
        description,
        topId: top.item.id,
        bottomId: bottom.item.id,
        miscId: misc.item.id,
        userId: ctx.session.user.id,
        prompt: input.prompt,
      }).returning();

      return {
        name,
        description,
        top: top.item,
        bottom: bottom.item,
        misc: misc.item,
        prompt: input.prompt,
      };
    })
}); 