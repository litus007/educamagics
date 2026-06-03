import { router, adminProcedure } from "../trpc-init";
import { z } from "zod";

export const userRouter = router({
  listAll: adminProcedure.query(async ({ ctx }) => {
    // Ara VS Code hauria de reconèixer ctx.db automàticament
    return await ctx.db.user.findMany({
      include: {
        parentProfile: true,
        teacherProfile: true,
        childProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),
  updateRole: adminProcedure
  .input(z.object({ userId: z.string(), role: z.enum(["PARENT", "TEACHER", "ADMIN"]) }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.user.update({
      where: { id: input.userId },
      data: { role: input.role },
    });
  }),
  createManual: adminProcedure
  .input(z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["PARENT", "TEACHER", "ADMIN"]),
  }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
      },
    });
  }),

  delete: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.delete({ 
        where: { id: input.userId } 
      });
    }),
});