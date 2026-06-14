# TARIQ — Sistema de Reserva de Transporte Saharaui

Sistema web de reserva de tickets de transporte entre los campamentos de refugiados saharauis de Tindouf y los territorios liberados del Sáhara Occidental.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** + Prisma ORM
- **Clerk** (auth)
- **tRPC v11** (API tipada)
- **Tailwind CSS** + shadcn-style components
- **next-intl** (árabe RTL, español, francés)
- **Redis/Upstash** + BullMQ (colas)
- **Cloudflare R2** (documentos privados)

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Editar DATABASE_URL, Clerk keys, etc.

# 3. Base de datos
npm run db:push
npm run db:seed

# 4. Desarrollo
npm run dev
```

Abre [http://localhost:3000/ar/dashboard](http://localhost:3000/ar/dashboard)

## Estructura principal

- `app/[locale]/(portal)/` — Portal ciudadano (dashboard, reserva, tickets)
- `app/[locale]/admin/` — Panel admin de wilaya
- `app/[locale]/super-admin/` — Administración central RASD
- `server/trpc/` — Routers tRPC
- `server/lib/quota-lock.ts` — Reserva atómica con SELECT FOR UPDATE
- `prisma/schema.prisma` — Schema completo

## Cuotas diarias (200 tickets)

| Wilaya   | Tickets/día |
|----------|-------------|
| El Aaiún | 50          |
| Auserd   | 40          |
| Rabouni  | 30          |
| Dakhla   | 40          |
| Smara    | 20          |
| Boujedur | 20          |

## Tests

```bash
npm test
```

## Deploy

- **App**: Vercel
- **DB**: Railway PostgreSQL
- **Redis**: Upstash
- **Storage**: Cloudflare R2

Configura los crons en `vercel.json` con `CRON_SECRET`.

---

**TARIQ — طريق** · Impacto humanitario real.
