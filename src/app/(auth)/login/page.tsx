"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type Mode = "magic-link" | "child-pin";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("magic-link");
  const [email, setEmail] = useState("");
  const [childId, setChildId] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleMagicLink() {
    setStatus("loading");
    const res = await signIn("email", { email, redirect: false });
    setStatus(res?.error ? "error" : "sent");
  }

  async function handleChildPin() {
    setStatus("loading");
    const res = await signIn("child-pin", {
      childProfileId: childId,
      pin,
      redirect: false,
    });
    if (res?.ok) {
      window.location.href = "/child";
    } else {
      setStatus("error");
    }
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50">
        
        {/* Logo Educamagics */}
        <div className="text-center mb-6">
        <img 
        src="/logo.png" 
        alt="Educamagics" 
        className="w-64 mx-auto mb-2" 
        />
        <p className="text-sky-700 font-semibold mt-2">Reforç escolar d'estiu</p>
      </div>

        {/* Mode selector */}
        <div className="flex rounded-2xl overflow-hidden border border-sky-200 mb-6 bg-white/50 p-1">
          <button
            onClick={() => setMode("magic-link")}
            className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-xl ${
              mode === "magic-link"
                ? "bg-sky-500 text-white shadow-md"
                : "text-sky-800 hover:bg-white/50"
            }`}
          >
            Pare / Professor
          </button>
          <button
            onClick={() => setMode("child-pin")}
            className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-xl ${
              mode === "child-pin"
                ? "bg-amber-500 text-white shadow-md"
                : "text-amber-800 hover:bg-white/50"
            }`}
          >
            Espai Nen/a 🚀
          </button>
        </div>

        {/* Formulari */}
        <div className="space-y-4">
          {mode === "magic-link" ? (
            status === "sent" ? (
              <div className="text-center py-6 text-sky-900">
                <span className="text-4xl">📬</span>
                <p className="mt-3 font-bold">Revisa el teu correu!</p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correu electrònic"
                  className="w-full border border-sky-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <button
                  onClick={handleMagicLink}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Enviar enllaç màgic ✨
                </button>
                <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                <p className="text-sm text-sky-900 font-medium">Vols veure com funcionen els nostres preus?</p>
                <a href="/pricing" className="text-sky-700 font-bold hover:underline">Consulta les nostres modalitats aquí</a>
                </div>
              </>
            )
            
          ) : (
            <>
              <div className="bg-amber-100/80 rounded-xl p-3 text-center text-amber-900 text-sm font-medium">
                Demana el teu codi al teu pare o mare 😊
              </div>
              <input
                type="text"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                placeholder="Codi d'estudiant"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                placeholder="••••"
                maxLength={4}
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={handleChildPin}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Entrar a classe 🚀
              </button>
            </>
          )}
        </div>
              </div>
    </main>
  );
}