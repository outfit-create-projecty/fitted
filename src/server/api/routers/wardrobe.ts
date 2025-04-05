import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const wardrobeRouter = createTRPCRouter({
  // Add basic wardrobe operations here
  getAll: publicProcedure.query(() => {
    return [];
  }),
}); 