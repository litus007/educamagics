"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"PARENT" | "TEACHER" | "ADMIN">("PARENT");

  const createMutation = trpc.user.createManual.useMutation({
    onSuccess: () => router.push("/admin/users"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email, role });
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-sky-950">Donar d'alta un usuari</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-3 border rounded-xl" placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full p-3 border rounded-xl" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <select className="w-full p-3 border rounded-xl" value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="PARENT">Pare/Mare</option>
          <option value="TEACHER">Professor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className="w-full bg-sky-600 text-white p-3 rounded-xl font-bold hover:bg-sky-700">
          Crear Usuari
        </button>
      </form>
    </div>
  );
}