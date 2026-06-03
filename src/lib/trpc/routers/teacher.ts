// src/lib/trpc/routers/teacher.ts
import { router, teacherProcedure, publicProcedure } from "../trpc-init";
import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const teacherRouter = router({
  search: publicProcedure
    .input(z.object({ 
      subject: z.string().optional(), 
      dayOfWeek: z.string().optional(), // Afegeixo el camp aquí
      page: z.number().default(1) 
    }))
    .query(async ({ ctx, input }) => {
      const PAGE_SIZE = 12;
      
      // Definim els filtres dinàmicament
      const where: any = { isActive: true };
      
      if (input.subject) {
        where.subjects = { some: { subject: input.subject as any } };
      }
      
      // Suposant que el teu model té una relació d'horaris (availability)
      if (input.dayOfWeek) {
        where.availability = { some: { dayOfWeek: input.dayOfWeek } };
      }

      const [teachers, total] = await Promise.all([
        ctx.db.teacherProfile.findMany({ 
          where, 
          include: { user: true, subjects: true }, 
          take: PAGE_SIZE, 
          skip: (input.page - 1) * PAGE_SIZE 
        }),
        ctx.db.teacherProfile.count({ where })
      ]);
      
      return { teachers, total, pages: Math.ceil(total / PAGE_SIZE) };
    }),

  listPendingBookings: teacherProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findMany({
      where: { timeSlot: { teacher: { userId: ctx.user.id } }, status: BookingStatus.PENDING_TEACHER },
      include: { child: true, timeSlot: true },
      orderBy: { createdAt: "asc" }
    });
  }),
});