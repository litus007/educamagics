"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export function PendingBookingCard({ booking }: { booking: any }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Hem corregit el nom de la mutació per coincidir amb el backend
  const { mutate, isPending } = trpc.booking.confirmByTeacher.useMutation({
    onSuccess: () => {
      // Intentem invalidar el router de les reserves
      // Si el teu router de bookings es diu 'booking', hauria de ser utils.booking...
      utils.booking.listPendingAdmin.invalidate();
      utils.teacher.invalidate(); 
      router.refresh();
    },
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <button 
        onClick={() => mutate({ bookingId: booking.id })}
        disabled={isPending}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
      >
        {isPending ? "Processant..." : "Acceptar ✓"}
      </button>
    </div>
  );
}