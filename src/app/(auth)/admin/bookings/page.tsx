"use client";
import { trpc } from "@/lib/trpc/client";
import { BookingStatus } from "@prisma/client";

export default function AdminBookingApproval() {
  const { data: bookings, refetch } = trpc.booking.listPendingAdmin.useQuery();
  const approveMutation = trpc.booking.updateStatus.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Reserves pendents d'Administració</h1>
      <div className="space-y-4">
        {bookings?.map((b) => (
          <div key={b.id} className="flex justify-between p-4 border rounded-xl bg-white shadow-sm">
            <div>
              <p className="font-bold">
                Alumne: {b.child.displayName} | Professor: {b.timeSlot.teacher.user.name}
              </p>
              <p className="text-sm text-gray-500">Data: {new Date(b.date).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => approveMutation.mutate({ id: b.id, status: BookingStatus.PENDING_TEACHER })}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Validar i enviar al Professor
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}