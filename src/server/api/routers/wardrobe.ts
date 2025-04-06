import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { clothingItems, outfits } from "~/server/db/schema";
import OpenAI from "openai";
import { env } from "~/env";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq, or } from "drizzle-orm";
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

const prompt = "You are a fashion expert. In a JSON format, classify this clothing item into 'top', 'bottom', 'shoes', or 'misc'. Along with this, create a name for it, and write a short description of it. Also create a list of stylistic tags that describe it. Please respond in the following format: { classification: 'top' | 'bottom' | 'shoes' | 'misc', name: string, description: string, tags: string[] }";

export const wardrobeRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const items = await ctx.db.query.clothingItems.findMany({
        where: eq(clothingItems.userId, ctx.session.user.id),
        orderBy: (items, { desc }) => [desc(items.id)],
      });

      return items;
    }),

  addPiece: protectedProcedure
    .input(z.object({ 
      userId: z.string(),
      imageBase64: z.string(),
      fileType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate UUID for the image
      const uuid = crypto.randomUUID();
      
      // Convert base64 to buffer
      const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${input.userId}/${uuid}`,
        Body: buffer,
        ContentType: input.fileType,
      }));

      // Get the CloudFront URL
      const imageUrl = `https://d2fz44w91whf0y.cloudfront.net/${input.userId}/${uuid}`;
      
      // Use OpenAI to classify the clothing item
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const { classification, name, description, tags } = JSON.parse(response.choices[0]?.message?.content ?? "{}");

      const tagsString = tags.join(", ");
      const tagsEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: tagsString,
      });
      const tagsEmbeddingArray = tagsEmbedding.data[0]?.embedding ?? [];
      if(tagsEmbeddingArray.length === 0) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No tags embedding found" });
      }

      // Add the clothing item to the database
      await ctx.db.insert(clothingItems).values({
        id: uuid,
        name: name,
        description: description,
        classification: classification,
        tagsVector: tagsEmbeddingArray,
        image: imageUrl,
        userId: input.userId,
      });

      return { success: true, imageUrl };
    }),

  deletePiece: protectedProcedure
    .input(z.object({
      id: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user || ctx.session.user.id !== input.userId) {
        throw new Error("Not authorized");
      }

      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${input.userId}/${input.id}`,
      }));

      // Delete all outfits that contain this item
      await ctx.db.delete(outfits)
        .where(or(eq(outfits.topId, input.id), eq(outfits.bottomId, input.id), eq(outfits.shoesId, input.id)));

      // Delete from database
      await ctx.db.delete(clothingItems)
        .where(eq(clothingItems.id, input.id));

      return { success: true };
    }),
}); 