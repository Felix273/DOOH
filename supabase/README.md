# Supabase Setup

This directory contains the database contract for the DOOH Platform.

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

If you are using a hosted Supabase project, apply the SQL files in
`supabase/migrations/` in filename order from the Supabase SQL editor or your
deployment pipeline.

The initial migration creates:

- user profiles linked to `auth.users`
- screen inventory and screen images
- bookings, payments, payouts, and notifications
- row-level security policies for advertisers, media owners, and admins
- an `auth.users` trigger that creates a profile from registration metadata

Users can self-register as `advertiser` or `media_owner`. The `admin` role should be assigned manually by an existing admin or through trusted server-side tooling.

## Demo Workflow Data

After migrations are applied, seed a repeatable verification dataset:

```bash
npm run seed:demo
```

The script reads `.env.local` and requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

It creates or updates these demo users with the same password:

- `advertiser.demo@dooh.local`
- `owner.demo@dooh.local`
- `admin.demo@dooh.local`

Default password: `DemoPass123!`

Set `DEMO_PASSWORD` before running the script to override the default.

## Verification Flow

Use the seeded accounts to verify the marketplace loop:

1. Log in as `admin.demo@dooh.local` and approve `Demo Pending Screen - Westlands`.
2. Log in as `advertiser.demo@dooh.local`, open `/screens`, and request a booking for an active screen.
3. Log in as `owner.demo@dooh.local`, open `/owner/bookings`, and approve the pending booking.
4. Log in as `advertiser.demo@dooh.local`, open `/bookings`, and submit an M-Pesa or bank reference for an approved unpaid booking.
5. Log in as `admin.demo@dooh.local`, open `/admin`, and mark the pending payment paid.
6. Confirm the advertiser booking shows `payment_status = paid`.
