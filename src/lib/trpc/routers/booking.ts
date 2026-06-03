import { router, parentProcedure, teacherProcedure, adminProcedure } from "../trpc-init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { BookingStatus } from "@prisma/client";

export const bookingRouter = router({
  
  listPendingAdmin: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.booking.findMany({
      where: { status: BookingStatus.PENDING_ADMIN },
      include: { 
        child: true, 
        timeSlot: { include: { teacher: { include: { user: true } } } } 
      },
    });
  }),

  create: parentProcedure
    .input(z.object({ childId: z.string(), timeSlotId: z.string(), date: z.date(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.booking.create({
        data: { ...input, status: BookingStatus.PENDING_ADMIN }
      });
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.nativeEnum(BookingStatus) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.booking.update({
        where: { id: input.id },
        data: { status: input.status }
      });
    }),

  listForParent: parentProcedure.query(async ({ ctx }) => {
    return await ctx.db.booking.findMany({
      where: { 
        child: { 
          parentId: ctx.session!.user.id 
        } 
      },
      include: { 
        timeSlot: { include: { teacher: { include: { user: true } } } },
        child: true 
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  confirmByTeacher: teacherProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: input.bookingId },
          include: { timeSlot: { include: { teacher: true } } }
        });

        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no trobada" });

        await tx.booking.update({ 
            where: { id: input.bookingId }, 
            data: { status: BookingStatus.CONFIRMED } 
        });
        
        return await tx.classSession.create({
          data: { 
            bookingId: booking.id, 
            status: "SCHEDULED", 
            teacherId: booking.timeSlot.teacherId, 
            livekitRoom: `room-${booking.id}` 
          }
        });
      });
    }),

  // Aquesta és la nova funció per al pare que volies:
  getAvailableSlots: parentProcedure
    .input(z.object({ teacherId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.timeSlot.findMany({
        where: { teacherId: input.teacherId, isBooked: false },
      });
    }),
});