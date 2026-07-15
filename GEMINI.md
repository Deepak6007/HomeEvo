# HomeEvo — Project Brain

## What is HomeEvo
HomeEvo is a home construction and renovation marketplace platform
targeting Andhra Pradesh, India. It connects homeowners with verified
local contractors, architects, and material vendors.

## The Three Roles
- CLIENT (homeowner): browses services, books vendors, pays via escrow,
  tracks projects via dashboard
- VENDOR / CONTRACTOR: receives leads, submits bids, manages milestones,
  gets paid via escrow
- ADMIN: verifies vendors, manages users, handles complaints, views analytics

## Tech Stack — NEVER deviate from this
- Framework: Next.js 14 with App Router (TypeScript, strict mode)
- Styling: Tailwind CSS + shadcn/ui components
- State (server): TanStack Query (React Query v5)
- State (client): Zustand v4 with persist middleware
- Forms: React Hook Form + Zod validation
- Auth: JWT (access token) + HTTP-only cookie + Next.js edge middleware
- Backend: Node.js + Express (already running)
- ORM: Prisma with PostgreSQL
- Payments: Razorpay (milestone-based escrow model)
- File uploads: Cloudinary (site photos, portfolio, blueprints)
- Real-time: Ably (notifications, project updates)
- AI: Anthropic claude-sonnet-4-20250514 (Blueprint Generator feature)

## Design System — NEVER deviate from this
- Primary accent: #E85D04 (orange)
- Client dashboard: warm earthy aesthetic, fonts: Fraunces serif + DM Sans
- Vendor dashboard: dark industrial aesthetic, fonts: Barlow Condensed + JetBrains Mono
- Public site: Syne display + DM Sans body
- Admin panel: Outfit + JetBrains Mono

## Folder Structure Law
- API service layer lives ONLY in src/lib/api/
- No fetch() or axios calls inside components or pages
- Zustand stores ONLY for: auth tokens, UI state, notifications
- TanStack Query for ALL server data (projects, leads, payments, etc.)
- Route groups: (public), (auth), (client), (vendor), (admin)

## Payment Rule — CRITICAL
Razorpay webhook handlers MUST be idempotent.
Use webhookId deduplication stored in Redis before processing any payment event.
This prevents double-payment bugs.

## API Response Envelope — ALL APIs must follow this shape
```json
{
  "success": boolean,
  "data": T,
  "message": string,
  "pagination": { "page": number, "pageSize": number, "total": number, "totalPages": number }
}
```

## Environment Variables (never hardcode these)
NEXT_PUBLIC_API_URL — backend base URL
NEXT_PUBLIC_RAZORPAY_KEY — Razorpay publishable key
NEXT_PUBLIC_WS_URL — Ably WebSocket URL
JWT_SECRET — server-only, never expose to client
