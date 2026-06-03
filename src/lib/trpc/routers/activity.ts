import { router, adminProcedure } from "../trpc-init";
import { z } from "zod";
import { ActivityType, DifficultyLevel } from "@prisma/client";

export const activityRouter = router({
  listAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.activity.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure
    .input(z.object({
      title: z.string(),
      type: z.nativeEnum(ActivityType),
      difficulty: z.nativeEnum(DifficultyLevel),
      pointsBase: z.number(),
      payload: z.any(), // El camp Json de Prisma accepta qualsevol cosa
    }))
    .mutation(async ({ ctx, input }) => {
      // Hem de passar els camps un a un perquè Prisma estigui content
      return await ctx.db.activity.create({
        data: {
          title: input.title,
          type: input.type,
          difficulty: input.difficulty,
          pointsBase: input.pointsBase,
          payload: input.payload as any, // Forcem el tipus a 'any' per saltar la restricció de Prisma
        }
      });
      }),
    })