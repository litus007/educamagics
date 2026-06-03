import { router, teacherProcedure, publicProcedure } from "../trpc-init";
import { z } from "zod";

export const teacherRouter = router({
  search: publicProcedure
    .input(z.object({ subject: z.string().optional(), page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      const PAGE_SIZE = 12;
      const where = { isActive: true, ...(input.subject && { subjects: { some: { subject: input.subject as any } } }) };
      const [teachers, total] = await Promise.all([
        ctx.db.teacherProfile.findMany({ where, include: { user: true, subjects: true }, take: PAGE_SIZE, skip: (input.page - 1) * PAGE_SIZE }),
        ctx.db.teacherProfile.count({ where })
      ]);
      return { teachers, total, pages: Math.ceil(total / PAGE_SIZE) };
    }),

  listPendingBookings: teacherProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findMany({
      where: { timeSlot: { teacher: { userId: ctx.user.id } }, status: "PENDING" },
      include: { child: true, timeSlot: true },
      orderBy: { createdAt: "asc" }
    });
  }),
});