"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function CreateActivityPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  
  const createMutation = trpc.activity.create.useMutation({
    onSuccess: () => router.push("/admin/activities"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      type: "NUMBER_SERIES", // Per defecte per la demo
      difficulty: "EASY",
      pointsBase: 100,
      payload: { sequence: [2, 4, 8], answer: 16 }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Nova Activitat</h1>
      <input 
        className="w-full p-2 border rounded mb-4"
        placeholder="Títol de l'activitat"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="bg-sky-600 text-white px-4 py-2 rounded">Crear</button>
    </form>
  );
}