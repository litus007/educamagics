"use client";

import { useState } from "react";

export default function RegisterUserPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "PARENT" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/admin/register-user", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Usuari creat correctament!");
      setFormData({ name: "", email: "", password: "", role: "PARENT" });
    } else {
      setMessage("Error: " + (data.error || "No s'ha pogut crear"));
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nou Usuari</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <input className="w-full border p-2" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input className="w-full border p-2" type="password" placeholder="Contrasenya" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <select className="w-full border p-2" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
          <option value="PARENT">Pare/Mare</option>
          <option value="TEACHER">Professor</option>
          <option value="CHILD">Nen</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Crear Usuari</button>
      </form>
      {message && <p className="mt-4 p-2 bg-gray-100">{message}</p>}
    </div>
  );
}