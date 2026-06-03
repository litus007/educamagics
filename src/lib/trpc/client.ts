"use client";
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/lib/trpc/router';

// Aquest és el teu hook principal per al frontend
export const trpc = createTRPCReact<AppRouter>();