import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  return { session, db };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

const hasRole = (role: string) => t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== role) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const parentProcedure = t.procedure.use(hasRole("PARENT"));
export const teacherProcedure = t.procedure.use(hasRole("TEACHER"));
export const childProcedure = t.procedure.use(hasRole("CHILD"));
export const adminProcedure = t.procedure.use(hasRole("ADMIN"));