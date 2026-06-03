"use client";

// Actualitzem els tipus acceptats
export type BookingStatus = "PENDING_ADMIN" | "PENDING_TEACHER" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface Booking {
  id: string;
  date: Date | string;
  status: BookingStatus;
  teacherName: string;
  childName: string;
  notes?: string | null;
  [key: string]: any; 
}

interface BookingListProps {
  bookings: Booking[];
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

export function BookingList({ bookings, onConfirm, onCancel }: BookingListProps) {
  
  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<BookingStatus, { label: string, bg: string }> = {
      PENDING_ADMIN: { label: "🛡️ Pendent Admin", bg: "bg-slate-100 text-slate-800 border-slate-200" },
      PENDING_TEACHER: { label: "⏳ Pendent Mentor", bg: "bg-amber-100 text-amber-800 border-amber-200" },
      CONFIRMED: { label: "✨ Confirmada", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      COMPLETED: { label: "✓ Finalitzada", bg: "bg-sky-100 text-sky-800 border-sky-200" },
      CANCELLED: { label: "❌ Cancel·lada", bg: "bg-rose-100 text-rose-800 border-rose-200" },
    };
    
    const current = config[status] ?? { label: status, bg: "bg-slate-100 text-slate-800 border-slate-200" };
    
    return (
      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${current.bg}`}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-xl space-y-4">
      <h2 className="text-xl font-black text-sky-950 flex items-center gap-2">
        📅 Historial de Sessions i Classes
      </h2>

      <div className="divide-y divide-sky-100/50 font-medium">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-sky-950">
                    {new Date(booking.date).toLocaleDateString("ca-ES", {
                      weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <p className="text-xs text-sky-900/80">
                  🧑‍🏫 Mentor: <strong className="text-sky-950">{booking.teacherName}</strong> · 
                  👶 Alumne: <span className="bg-white/60 px-1.5 py-0.5 rounded border border-sky-100/50 font-bold">{booking.childName}</span>
                </p>

                {booking.notes && (
                  <p className="text-[11px] text-sky-800/60 italic bg-white/30 p-2 rounded-xl border border-white/30 inline-block max-w-lg mt-1">
                    💬 Nota: "{booking.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {["PENDING_ADMIN", "PENDING_TEACHER"].includes(booking.status) && (
                  <>
                    {onCancel && (
                      <button 
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl transition-all"
                        onClick={() => onCancel(booking.id)}
                      >
                        Anul·lar
                      </button>
                    )}
                    {onConfirm && (
                      <button 
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm transition-all"
                        onClick={() => onConfirm(booking.id)}
                      >
                        Confirmar
                      </button>
                    )}
                  </>
                )}
                <button 
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-white/80 hover:bg-white border border-sky-100 px-3 py-1.5 rounded-xl shadow-sm transition-all"
                  onClick={() => alert("Visualitzant detalls")}
                >
                  Veure detalls
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sky-950/50 text-sm">🎈 Encara no has agendat cap sessió.</div>
        )}
      </div>
    </div>
  );
}