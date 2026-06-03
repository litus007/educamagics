import { router, parentProcedure } from "../trpc-init";

export const childRouter = router({
  listForParent: parentProcedure.query(async ({ ctx }) => {
    return ctx.db.child.findMany({
      where: { parent: { userId: ctx.user.id } },
      include: { bookings: { include: { timeSlot: { include: { teacher: { include: { user: true } } } }, session: true } } }
    });
  }),
});