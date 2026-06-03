# 🎓 Educamagics — MVP

Plataforma de reforç escolar d'estiu que connecta nens amb professors particulars en remot.

## Stack tecnològic

| Capa | Tecnologia | Cost MVP |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) + tRPC | Gratis (Vercel free) |
| Base de dades | PostgreSQL via Supabase | Gratis (500 MB) |
| Autenticació | NextAuth.js + Magic Link | Gratis |
| Email | Resend | Gratis (3.000/mes) |
| Video/Àudio | LiveKit Cloud | Gratis (50 GB/mes) |
| Pissarra | tldraw (open source) | Gratis |
| Cache/Presència | Upstash Redis | Gratis (10.000 req/dia) |

**Cost total MVP: 0 €/mes** fins a escala significativa.

---

## Posada en marxa

### 1. Clona i instal·la

```bash
git clone <repo>
cd educamagics
npm install
```

### 2. Configura les variables d'entorn

```bash
cp .env.example .env.local
# Edita .env.local amb les teves claus
```

#### Supabase
1. Crea un projecte a [supabase.com](https://supabase.com)
2. Ve a **Settings → Database**
3. Copia la **Transaction pooler** URL (port 6543) com a `DATABASE_URL`
4. Copia la **Direct connection** URL (port 5432) com a `DIRECT_DATABASE_URL`

#### Resend
1. Registra't a [resend.com](https://resend.com)
2. Crea una API key i afegeix-la a `RESEND_API_KEY`
3. Verifica el teu domini o usa el de proves de Resend

#### LiveKit
1. Crea un projecte a [livekit.io/cloud](https://livekit.io/cloud)
2. Copia les claus a `LIVEKIT_URL`, `LIVEKIT_API_KEY` i `LIVEKIT_API_SECRET`

### 3. Inicialitza la base de dades

```bash
# Aplica el schema a Supabase
npm run db:migrate

# (Opcional) Carrega dades de demo
npm run db:seed
```

### 4. Inicia el servidor de desenvolupament

```bash
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000)

---

## Usuaris de demo (després del seed)

| Rol | Accés |
|---|---|
| Pare | Magic Link a `pare@demo.com` |
| Professor | Magic Link a `professor@demo.com` |
| Nen | ID del ChildProfile (mostra el seed) + PIN `1234` |

---

## Estructura del projecte

```
educamagics/
├── prisma/
│   ├── schema.prisma       # Model de dades complet
│   └── seed.ts             # Dades de demo
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/      # Pàgina d'accés (Magic Link + PIN)
│   │   │   ├── parent/     # Dashboard del pare
│   │   │   ├── child/      # Interfície gamificada del nen
│   │   │   └── teacher/    # Portal del professor
│   │   ├── classroom/
│   │   │   └── [sessionId]/ # Aula virtual (LiveKit + tldraw)
│   │   └── api/
│   │       ├── auth/        # NextAuth endpoints
│   │       ├── trpc/        # API tRPC
│   │       └── webhooks/    # Processament de notificacions
│   ├── components/
│   │   ├── classroom/       # ClassroomClient, TeacherMultitaskView, Whiteboard
│   │   ├── dashboard/       # ChildClassCard, TeacherSearch, BookingList...
│   │   └── layout/          # Providers (tRPC + NextAuth + ReactQuery)
│   └── lib/
│       ├── auth/            # Configuració NextAuth
│       ├── db/              # Singleton Prisma
│       ├── livekit/         # Generació de tokens
│       └── trpc/            # Router complet
└── middleware.ts            # Protecció de rutes per rol
```

---

## Aïllament d'alumnes a LiveKit

El mode multitasca del professor és la funcionalitat més complexa.
L'aïllament s'implementa a **LiveKit Cloud** amb **Track Permissions**:

```typescript
// Quan un alumne entra, el servidor configura:
// - Pot subscriure's NOMÉS als tracks del professor
// - El professor pot subscriure's a tots els tracks

await roomServiceClient.updateParticipant(roomName, studentIdentity, {
  canSubscribe: false, // per defecte no pot subscriure's a ningú
  canPublish: true,
});

// Després concedim permís per subscriure's NOMÉS al professor
await roomServiceClient.updateSubscriptions(roomName, studentIdentity, [
  { participantIdentity: teacherIdentity, trackSids: ['*'] }
]);
```

Consulta la [documentació de LiveKit Track Permissions](https://docs.livekit.io/home/client/tracks/track-permissions/).

---

## Roadmap post-MVP

- [ ] Pagaments (Stripe) — fase 2
- [ ] App mòbil nativa (Expo + LiveKit SDK)
- [ ] Gravació de sessions (LiveKit Egress → S3)
- [ ] Gamificació avançada (badges, rankings)
- [ ] Recordatoris SMS (Twilio)
- [ ] Panel d'administració complet
