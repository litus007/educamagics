// src/app/api/trpc/[trpc]/route.ts
// Handler tRPC per a l'App Router

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc-init";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req } as any),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error a ${path}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
