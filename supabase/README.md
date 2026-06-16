# Supabase Setup

This directory contains the database contract for the DOOH Platform.

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

The initial migration creates:

- user profiles linked to `auth.users`
- screen inventory and screen images
- bookings, payments, payouts, and notifications
- row-level security policies for advertisers, media owners, and admins
- an `auth.users` trigger that creates a profile from registration metadata

Users can self-register as `advertiser` or `media_owner`. The `admin` role should be assigned manually by an existing admin or through trusted server-side tooling.
