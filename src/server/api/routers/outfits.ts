import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const outfitsRouter = createTRPCRouter({
  // Add basic outfit operations here
  getAll: publicProcedure.query(() => {
    return [];
  }),
}); 