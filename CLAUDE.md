@AGENTS.md

## Project

Shobra Travel Agency — full-stack travel booking platform for a boutique travel agency based in Short Hills, NJ.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma 7 + PostgreSQL
- Square SDK for payments
- Deployed on Vercel (planned)

## Development

```bash
npm run dev          # start dev server
npm run db:migrate   # run prisma migrations
npm run db:seed      # seed admin user + sample data
npm run build        # production build
```

## Key Patterns

- Prisma 7 uses adapter pattern — see `src/lib/db.ts` for PrismaPg setup
- Database URL is configured in `prisma.config.ts`, NOT in `schema.prisma`
- Admin auth uses cookie-based sessions — see `src/lib/auth.ts`
- Admin pages live under `src/app/admin/(dashboard)/` with shared sidebar layout
- Public API routes at `src/app/api/`, admin API routes at `src/app/api/admin/`
- Pages that query DB at render time use `export const dynamic = "force-dynamic"`

## Conventions

- Styling: black/white primary, gold (#c8a96e) accent, blue (#2098d1) secondary
- Typography: Rubik for headings, Roboto for body
- All headings uppercase with tracking-wider
- No rounded corners — sharp/square edges throughout
