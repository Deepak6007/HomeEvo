# Switching to Neon (when you're ready)

1. Sign up at [neon.tech](https://neon.tech)
2. Create project: `homeevo-production`, region: `aws-ap-south-1` (Mumbai)
3. Copy the connection string from Neon dashboard
4. Create `.env.production`:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.ap-south-1.aws.neon.tech/neondb?sslmode=require"
   ```
5. Run: `npx prisma migrate deploy`
   (applies all existing migrations to Neon — no data loss, no schema changes)
6. Run seed ONLY if starting fresh: `npx prisma db seed`
7. That's it — zero code changes required.

# Neon-specific tips
- **Connection Pooling**: Enable connection pooling in the Neon dashboard (PgBouncer mode).
- **Vercel Integration**: Add `?pgbouncer=true&connect_timeout=15` to your connection string when deploying to Vercel/serverless environments.
- **Compute Auto-Suspending**: Neon auto-pauses after 5 minutes of inactivity on the free tier — this is fine for dev, but you should upgrade to a paid tier for production to prevent cold starts.
- **Neon Branching**: Use Neon branching to create a database branch per Git Pull Request for isolated staging/testing environment setups.
