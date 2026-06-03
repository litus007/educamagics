// src/app/child/[childId]/classes/page.tsx
"use client";
import { trpc } from "@/components/layout/Providers"; // Ajusta el path segons el teu projecte
import { BookingList } from "@/components/common/BookingList";

export default function ChildClassesPage({ params }: { params: { childId: string } }) {
  const { data: rawBookings } = trpc.booking.listByChild.useQuery({ childId: params.childId });

  const bookings = rawBookings?.map(b => ({
    id: b.id,
    date: b.date,
    status: b.status as any,
    teacherName: b.timeSlot.teacher.user.name ?? "Desconegut",
    childName: "Tu", // Com que estem al seu dashboard, sabem qui és
    notes: b.notes
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-sky-950">Les meves sessions</h2>
      <BookingList bookings={bookings} />
    </div>
  );
}