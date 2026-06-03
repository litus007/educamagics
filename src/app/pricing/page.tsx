// src/app/pricing/page.tsx
export default function PricingPage() {
  const plans = [
    { name: "Individual", price: "25€", description: "Sessió única", features: ["Reserva flexible", "Accés directe"] },
    { name: "Setmanal", price: "90€", description: "Pack 4 sessions", features: ["Estalvi de 10€", "Prioritat d'horari", "Assignació fixa"] },
    { name: "Mensual", price: "320€", description: "Pack 16 sessions", features: ["Estalvi de 80€", "Pla personalitzat", "Atenció preferent"] },
  ];

  return (
    
        <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat page-transition p-6 md:p-10"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      <div className="max-w-5xl mx-auto">
         {/* Botó de retorn */}
        <a 
          href="/login" 
          className="inline-flex items-center gap-2 text-sky-700 font-bold hover:text-sky-900 transition-colors mb-8"
        >
          <span>←</span> Tornar al login
        </a>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl">
              <h2 className="text-2xl font-bold text-sky-900">{plan.name}</h2>
              <p className="text-4xl font-black my-4 text-sky-600">{plan.price}</p>
              <p className="text-sm text-sky-800/60 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="text-sm font-medium text-sky-900">✅ {f}</li>
                ))}
              </ul>
              
              <button className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold transition-all shadow-md">
                Contractar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}