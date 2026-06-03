// src/lib/trpc/router.ts
// Router principal de tRPC
// Agrupa tots els sub-routers per rol
import { router } from "./trpc-init";
import { teacherRouter } from "./routers/teacher";
import { bookingRouter } from "./routers/booking";
import { sessionRouter } from "./routers/session";
import { childRouter } from "./routers/child";
import { userRouter } from "./routers/user";
import { activityRouter } from "./routers/activity";
import { timeSlotRouter } from "./routers/timeSlotRouter";

export const appRouter = router({
  teacher: teacherRouter,
  booking: bookingRouter,
  session: sessionRouter,
  child: childRouter,
  user: userRouter,
  activity: activityRouter,
  timeSlot: timeSlotRouter,
});

export type AppRouter = typeof appRouter;