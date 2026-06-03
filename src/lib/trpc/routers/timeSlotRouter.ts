// src/lib/trpc/routers/timeSlot.ts
import { z } from "zod";
import { teacherProcedure, router } from "../trpc-init";
import { DayOfWeek } from "@prisma/client";

export const timeSlotRouter = router({
  // Crear una nova franja horària
  create: teacherProcedure
  .input(z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek), // O el tipus que hagis definit a l'enum
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format ha de ser HH:MM"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format ha de ser HH:MM"),
    capacity: z.number().default(1),
  }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.timeSlot.create({
      data: {
        teacherId: ctx.user.id, // Recorda que si teacherId és una relació amb l'User, potser necessites ctx.user.id
        ...input,
      },
    });
  }),

  // Llistar les meves franges (perquè el professor les pugui veure i editar)
  listMySlots: teacherProcedure.query(async ({ ctx }) => {
    return await ctx.db.timeSlot.findMany({
      where: { teacherId: ctx.user.id },
      orderBy: { startTime: "asc" },
    });
  }),
});