# Meridian

Multi-tenant school operating system for families, teachers, school admins, and a network super admin.

The product is original. Screenshots were used only as a UX prompt (parent-first mobile dashboard, sibling switcher, fee summary). No third-party branding or personal data is included.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide icons
- Recharts
- Supabase-ready PostgreSQL schema, RLS, and Storage policies
- Offline demo store so the UI is fully usable before a Supabase project is attached

## GitHub Pages

The app uses `HashRouter` and a relative Vite `base`, so it can live on a project site such as `https://YOUR_USER.github.io/meridian/`.

1. Create a GitHub repo and push this folder.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/pages.yml` builds and publishes `dist`.
4. Open `https://YOUR_USER.github.io/REPO/#/login`.

Demo data stays in each visitor’s browser (`localStorage`). This is not a shared live school database.

## Run

```bash
cd meridian
npm install
npm run dev
```

Open the printed local URL. The layout is mobile-first; resize to a phone width to see the parent app chrome.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Parent (two children) | parent@northridge.edu | Parent@123 |
| Teacher | teacher@northridge.edu | Teacher@123 |
| School admin | admin@northridge.edu | Admin@123 |
| Super admin | super@meridian.app | Super@123 |
| Parent at a second school | parent@harborview.edu | Parent@123 |

Use **Reset demo data** on the login screen if local state gets messy.

## What is real in the demo

Dashboard numbers are computed from records:

- Attendance % from daily attendance rows
- Homework pending count from submissions
- Fee total / paid / due from fee lines and successful payments
- Unread messages and notifications from read timestamps
- Sibling switch reloads every derived number for the selected student
- Health records honour a `visibleToParents` flag
- Payments are created as `processing` and only become `success` after `verifyPaymentOnServer` (the stand-in for a Razorpay/Cashfree webhook / Edge Function)

School A rows never appear for School B users because every query is scoped by `school_id` and parent-child links.

## Connect Supabase

1. Create a project.
2. Run, in order:
   - `supabase/schema.sql`
   - `supabase/rls.sql`
   - `supabase/storage.sql`
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` plus the **anon** key only.
4. Never put the service role key in the frontend.
5. Map Edge Functions to `mark_payment_success` for live gateways.

The TypeScript store in `src/lib/store.ts` is the service layer you can swap onto PostgREST queries table-by-table.

## Multi-tenancy

Every school-owned table includes `school_id`. RLS policies allow:

- Super admin: all schools
- School staff: only their `user_roles.school_id`
- Parents: only linked students through `student_parents`

Indexes are defined for class/section lists, attendance-by-date, payments, and notifications so a 10k-student school can paginate instead of loading everyone.

## PWA

`public/manifest.webmanifest` and `public/sw.js` register a standalone shell.
