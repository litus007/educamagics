"use client";
import { trpc } from "@/components/layout/Providers";
import { BookingList } from "@/components/common/BookingList";

export default function ChildClassesPage({ params }: { params: { childId: string } }) {
  // Canviem per (trpc.booking as any)
  const { data: rawBookings } = (trpc.booking as any).listByChild.useQuery({ 
    childId: params.childId 
  });

  const bookings = rawBookings?.map((b: any) => ({
    id: b.id,
    date: b.date,
    status: b.status as any,
    teacherName: b.timeSlot?.teacher?.user?.name ?? "Desconegut",
    childName: "Tu",
    notes: b.notes
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-sky-950">Les meves sessions</h2>
      <BookingList bookings={bookings} />
    </div>
  );
}