"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { DayOfWeek } from "@prisma/client";

export default function TeacherSchedulePage() {
  const utils = trpc.useContext();
  const { data: slots } = trpc.timeSlot.listMySlots.useQuery();
  
  // Mutació per crear franges
  const createSlot = trpc.timeSlot.create.useMutation({
    onSuccess: () => utils.timeSlot.listMySlots.invalidate(), // Refresca la llista automàticament
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createSlot.mutate({
      dayOfWeek: formData.get("dayOfWeek") as DayOfWeek,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      capacity: parseInt(formData.get("capacity") as string),
    });
  };

  return (
    <main className="p-8 space-y-8">
      {/* Formulari senzill */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="font-bold text-lg">Nova Franja Horària</h2>
        <div className="grid grid-cols-2 gap-4">
          <select name="dayOfWeek" className="border p-2 rounded">
            {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input name="capacity" type="number" defaultValue={1} className="border p-2 rounded" placeholder="Capacitat" />
          <input name="startTime" type="time" className="border p-2 rounded" />
          <input name="endTime" type="time" className="border p-2 rounded" />
        </div>
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg font-bold">Crear Franja</button>
      </form>

      {/* Llista de franges */}
      <div className="grid gap-4">
        {slots?.map((slot: any) => (
          <div key={slot.id} className="p-4 bg-white rounded-lg border shadow-sm flex justify-between">
            <div>
              <p className="font-bold">{slot.dayOfWeek}</p>
              <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}