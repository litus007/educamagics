// src/components/admin/AdminActionsClient.tsx
"use client";

import { useState } from "react";

export function AdminActionsClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "PARENT" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error desconegut");
      
      setMessage("✅ Creat correctament!");
      setFormData({ name: "", email: "", password: "", role: "PARENT" });
      setTimeout(() => { setIsOpen(false); setMessage(""); window.location.reload(); }, 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
      <h2 className="text-lg font-bold text-sky-900">⚡ Accions d'Administració</h2>
      
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all text-left flex justify-between items-center shadow-md"
      >
        <span>➕ Registrar Nou Usuari</span>
        <span>➔</span>
      </button>

      {/* Finestra Modal Flotant */}
      {isOpen && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-xl font-black text-sky-900">Crear compte a Educamagics</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3 font-medium text-sm">
              <div>
                <label className="block text-sky-800 text-xs font-bold mb-1">Nom Complet</label>
                <input required type="text" placeholder="Ex: Professor Carles" className="w-full p-2.5 bg-sky-50/50 border border-sky-100 rounded-xl outline-none focus:border-sky-400" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sky-800 text-xs font-bold mb-1">Correu Electrònic</label>
                <input required type="email" placeholder="correu@educamagics.com" className="w-full p-2.5 bg-sky-50/50 border border-sky-100 rounded-xl outline-none focus:border-sky-400" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sky-800 text-xs font-bold mb-1">Contrasenya Inicial</label>
                <input required type="password" placeholder="••••••••" className="w-full p-2.5 bg-sky-50/50 border border-sky-100 rounded-xl outline-none focus:border-sky-400" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sky-800 text-xs font-bold mb-1">Tipus de Rol</label>
                <select className="w-full p-2.5 bg-sky-50/50 border border-sky-100 rounded-xl outline-none focus:border-sky-400 font-bold text-sky-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="PARENT">Pare / Mare</option>
                  <option value="TEACHER">Professor /a</option>
                  <option value="CHILD">Alumne (Nen)</option>
                </select>
              </div>

              {message && <p className="text-center text-xs font-bold p-2 bg-sky-50 rounded-xl">{message}</p>}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all">
                  {loading ? "Creant..." : "Confirmar i Crear ✓"}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                  Cancel·lar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}