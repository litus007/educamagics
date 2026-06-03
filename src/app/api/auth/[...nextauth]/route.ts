// src/app/api/auth/[...nextauth]/route.ts
// Punt d'entrada de NextAuth per a l'App Router de Next.js 14

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
