import { router, teacherProcedure, childProcedure, protectedProcedure } from "../trpc-init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const sessionRouter = router({
  checkLive: childProcedure.input(z.object({ sessionId: z.string() })).query(async ({ ctx, input }) => {
    const session = await ctx.db.classSession.findUnique({ where: { id: input.sessionId }, select: { status: true, livekitRoom: true } });
    return { isLive: session?.status === "LIVE", roomName: session?.livekitRoom };
  }),
  start: teacherProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.classSession.update({ where: { id: input.sessionId }, data: { status: "LIVE", startedAt: new Date() } });
  }),
  getToken: protectedProcedure.input(z.object({ sessionId: z.string() })).query(async ({ ctx, input }) => {
    const { createLiveKitToken } = await import("@/lib/livekit/token");
    const session = await ctx.db.classSession.findUnique({ where: { id: input.sessionId }, select: { livekitRoom: true, status: true } });
    if (!session || session.status === "ENDED") throw new TRPCError({ code: "NOT_FOUND" });
    const token = await createLiveKitToken({ roomName: session.livekitRoom, participantId: ctx.user.id, participantName: ctx.user.name ?? "Usuari", isTeacher: ctx.user.role === "TEACHER" });
    return { token, roomName: session.livekitRoom, wsUrl: process.env.LIVEKIT_URL! };
  }),
});