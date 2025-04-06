import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clothingItems, outfits } from "~/server/db/schema";
import OpenAI from "openai";
import { env } from "~/env";
import { eq, and } from "drizzle-orm";
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

const prompt = "You are a fashion expert. I have a client that is trying to create an outfit for their specific prompt. Please return a list of stylistic tags in JSON format that describe the outfit. If the prompt mentions specific accessories (like 'add a watch' or 'include a necklace'), include tags that would match with those specific accessories. Please respond in the following format: { tags: string[], includeAccessories: boolean, requestedAccessories: string[] }";
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
        orderBy: (outfit, { desc }) => [desc(outfit.id)],
      });

      return allOutfits;
    }),

  rate: protectedProcedure
    .input(z.object({
      outfitId: z.string(),
      rating: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const { outfitId, rating } = input;

      const updatedOutfit = await ctx.db.update(outfits).set({
        rating,
      }).where(and(eq(outfits.id, outfitId), eq(outfits.userId, ctx.session.user.id)));

      return updatedOutfit;
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

      const { tags, includeAccessories, requestedAccessories } = JSON.parse(outfit.choices[0]?.message?.content ?? "{}");
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
      
      // Refined misc item selection logic
      let misc = [];
      
      // Check if specific accessories are requested
      const hasSpecificAccessoryRequest = requestedAccessories && requestedAccessories.length > 0;
      
      if (hasSpecificAccessoryRequest) {
        // If specific accessories are requested, prioritize those types
        for (const requestedAccessory of requestedAccessories) {
          // Find the best matching misc item for each requested accessory type
          const matchingItems = sortedOutfitItems.filter(item => 
            item.item.classification === "misc" && 
            item.item.name.toLowerCase().includes(requestedAccessory.toLowerCase())
          );
          
          if (matchingItems.length > 0) {
            // Add the best matching item for this accessory type
            misc.push(matchingItems[0]);
          }
        }
        
        // If we couldn't find exact matches, try to find similar items
        if (misc.length === 0) {
          // Look for misc items with high scores that might be similar to requested accessories
          const similarItems = sortedOutfitItems.filter(item => 
            item.item.classification === "misc" && 
            item.score > avg * 0.8
          ).slice(0, 3);
          
          misc = similarItems;
        }
      } else if (includeAccessories || description.toLowerCase().includes("accessor")) {
        // If general accessories are requested but not specific ones
        // Use a moderate threshold to include a few well-matching accessories
        const moderateThreshold = avg * 0.8; // 80% of the average score
        misc = sortedOutfitItems.filter((item) => 
          item.item.classification === "misc" && 
          item.score > moderateThreshold
        ).slice(0, 3);
      } else {
        // Original logic for when accessories aren't specifically requested
        // Only include accessories that match very well with the outfit
        misc = sortedOutfitItems.filter((item) => 
          item.item.classification === "misc" && 
          item.score > avg
        ).slice(0, 2);
      }

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

  delete: protectedProcedure
    .input(z.object({
      outfitId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { outfitId } = input;
      const deletedOutfit = await ctx.db.delete(outfits).where(and(eq(outfits.id, outfitId), eq(outfits.userId, ctx.session.user.id)));
      return deletedOutfit;
    }),
}); 