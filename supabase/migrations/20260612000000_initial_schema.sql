-- DOOH Platform initial schema
-- Creates the core marketplace tables and RLS policies used by the app.

create extension if not exists pgcrypto;

create type public.user_role as enum ('advertiser', 'media_owner', 'admin');
create type public.screen_type as enum ('billboard', 'mall', 'transit', 'airport', 'retail');
create type public.screen_status as enum ('pending', 'active', 'suspended');
create type public.booking_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'completed');
create type public.booking_payment_status as enum ('pending', 'paid', 'refunded');
create type public.payment_method as enum ('mpesa', 'card');
create type public.payment_record_status as enum ('pending', 'completed', 'failed');
create type public.payout_status as enum ('pending', 'processing', 'completed');
create type public.notification_type as enum ('booking', 'payment', 'approval', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  phone text,
  role public.user_role not null default 'advertiser',
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  screen_type public.screen_type not null,
  status public.screen_status not null default 'pending',
  width_meters numeric(8, 2),
  height_meters numeric(8, 2),
  resolution_width integer,
  resolution_height integer,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  address text not null,
  city text not null,
  area text,
  operating_hours_start time not null default '00:00',
  operating_hours_end time not null default '23:59',
  price_per_day numeric(12, 2) not null,
  price_per_week numeric(12, 2),
  price_per_month numeric(12, 2),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint screens_positive_size check (
    (width_meters is null or width_meters > 0)
    and (height_meters is null or height_meters > 0)
  ),
  constraint screens_positive_resolution check (
    (resolution_width is null or resolution_width > 0)
    and (resolution_height is null or resolution_height > 0)
  ),
  constraint screens_positive_prices check (
    price_per_day >= 0
    and (price_per_week is null or price_per_week >= 0)
    and (price_per_month is null or price_per_month >= 0)
  )
);

create table public.screen_images (
  id uuid primary key default gen_random_uuid(),
  screen_id uuid not null references public.screens(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  advertiser_id uuid not null references public.profiles(id) on delete cascade,
  screen_id uuid not null references public.screens(id) on delete restrict,
  status public.booking_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  total_days integer not null,
  amount_subtotal numeric(12, 2) not null,
  platform_fee numeric(12, 2) not null,
  amount_total numeric(12, 2) not null,
  creative_url text,
  creative_format text,
  payment_status public.booking_payment_status not null default 'pending',
  payment_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_dates check (end_date >= start_date),
  constraint bookings_positive_days check (total_days > 0),
  constraint bookings_positive_amounts check (
    amount_subtotal >= 0
    and platform_fee >= 0
    and amount_total >= 0
  )
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  advertiser_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'KES',
  method public.payment_method not null,
  provider_reference text,
  status public.payment_record_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_positive_amount check (amount >= 0)
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  media_owner_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  gross_amount numeric(12, 2) not null,
  platform_fee numeric(12, 2) not null,
  net_amount numeric(12, 2) not null,
  status public.payout_status not null default 'pending',
  payout_method text,
  payout_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payouts_positive_amounts check (
    gross_amount >= 0
    and platform_fee >= 0
    and net_amount >= 0
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index screens_owner_id_idx on public.screens(owner_id);
create index screens_status_city_idx on public.screens(status, city);
create index screen_images_screen_id_idx on public.screen_images(screen_id);
create index bookings_advertiser_id_idx on public.bookings(advertiser_id);
create index bookings_screen_id_idx on public.bookings(screen_id);
create index bookings_status_idx on public.bookings(status);
create index payments_booking_id_idx on public.payments(booking_id);
create index payments_advertiser_id_idx on public.payments(advertiser_id);
create index payouts_media_owner_id_idx on public.payouts(media_owner_id);
create index notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger screens_set_updated_at
  before update on public.screens
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create trigger payouts_set_updated_at
  before update on public.payouts
  for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.is_verified := old.is_verified;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

create or replace function public.protect_screen_review_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.owner_id := old.owner_id;
    new.status := old.status;
    new.is_featured := old.is_featured;
  end if;

  return new;
end;
$$;

create trigger screens_protect_review_fields
  before update on public.screens
  for each row execute function public.protect_screen_review_fields();

create or replace function public.protect_booking_financial_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.reference := old.reference;
    new.advertiser_id := old.advertiser_id;
    new.screen_id := old.screen_id;
    new.start_date := old.start_date;
    new.end_date := old.end_date;
    new.total_days := old.total_days;
    new.amount_subtotal := old.amount_subtotal;
    new.platform_fee := old.platform_fee;
    new.amount_total := old.amount_total;
    new.payment_status := old.payment_status;
    new.payment_reference := old.payment_reference;
  end if;

  return new;
end;
$$;

create trigger bookings_protect_financial_fields
  before update on public.bookings
  for each row execute function public.protect_booking_financial_fields();

create or replace function public.protect_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.booking_id := old.booking_id;
    new.advertiser_id := old.advertiser_id;
    new.amount := old.amount;
    new.currency := old.currency;
    new.method := old.method;
    new.provider_reference := old.provider_reference;
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger payments_protect_fields
  before update on public.payments
  for each row execute function public.protect_payment_fields();

create or replace function public.owns_screen(screen_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.screens
    where screens.id = screen_id
      and screens.owner_id = auth.uid()
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  assigned_role public.user_role;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  assigned_role := case
    when requested_role = 'media_owner' then 'media_owner'::public.user_role
    else 'advertiser'::public.user_role
  end;

  insert into public.profiles (
    id,
    full_name,
    company_name,
    phone,
    role,
    avatar_url
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    assigned_role,
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        company_name = excluded.company_name,
        phone = excluded.phone,
        role = excluded.role,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.screens enable row level security;
alter table public.screen_images enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.screens, public.screen_images to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_screen(uuid) to authenticated;

create policy "Users can read their own profile or admins can read all profiles"
on public.profiles
for select
to authenticated
using (auth.uid() is not null and (id = auth.uid() or public.is_admin()));

create policy "Users can update their own profile or admins can update profiles"
on public.profiles
for update
to authenticated
using (auth.uid() is not null and (id = auth.uid() or public.is_admin()))
with check (auth.uid() is not null and (id = auth.uid() or public.is_admin()));

create policy "Admins can insert profiles"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can delete profiles"
on public.profiles
for delete
to authenticated
using (public.is_admin());

create policy "Anyone can read active screens"
on public.screens
for select
to anon, authenticated
using (status = 'active');

create policy "Owners and admins can read their screens"
on public.screens
for select
to authenticated
using (owner_id = auth.uid() or public.is_admin());

create policy "Media owners and admins can create screens"
on public.screens
for insert
to authenticated
with check (
  auth.uid() is not null
  and owner_id = auth.uid()
  and public.current_user_role() in ('media_owner', 'admin')
);

create policy "Owners and admins can update screens"
on public.screens
for update
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

create policy "Owners and admins can delete screens"
on public.screens
for delete
to authenticated
using (owner_id = auth.uid() or public.is_admin());

create policy "Anyone can read images for active screens"
on public.screen_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.screens
    where screens.id = screen_images.screen_id
      and screens.status = 'active'
  )
);

create policy "Screen owners and admins can manage screen images"
on public.screen_images
for all
to authenticated
using (public.owns_screen(screen_id) or public.is_admin())
with check (public.owns_screen(screen_id) or public.is_admin());

create policy "Booking participants and admins can read bookings"
on public.bookings
for select
to authenticated
using (
  advertiser_id = auth.uid()
  or public.owns_screen(screen_id)
  or public.is_admin()
);

create policy "Advertisers and admins can create bookings"
on public.bookings
for insert
to authenticated
with check (
  auth.uid() is not null
  and advertiser_id = auth.uid()
  and public.current_user_role() in ('advertiser', 'admin')
);

create policy "Booking participants and admins can update bookings"
on public.bookings
for update
to authenticated
using (
  advertiser_id = auth.uid()
  or public.owns_screen(screen_id)
  or public.is_admin()
)
with check (
  advertiser_id = auth.uid()
  or public.owns_screen(screen_id)
  or public.is_admin()
);

create policy "Admins can delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_admin());

create policy "Payment participants and admins can read payments"
on public.payments
for select
to authenticated
using (
  advertiser_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.bookings
    where bookings.id = payments.booking_id
      and public.owns_screen(bookings.screen_id)
  )
);

create policy "Advertisers and admins can create payments"
on public.payments
for insert
to authenticated
with check (
  auth.uid() is not null
  and advertiser_id = auth.uid()
  and public.current_user_role() in ('advertiser', 'admin')
);

create policy "Admins can update payments"
on public.payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete payments"
on public.payments
for delete
to authenticated
using (public.is_admin());

create policy "Media owners and admins can read payouts"
on public.payouts
for select
to authenticated
using (media_owner_id = auth.uid() or public.is_admin());

create policy "Admins can create payouts"
on public.payouts
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update payouts"
on public.payouts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete payouts"
on public.payouts
for delete
to authenticated
using (public.is_admin());

create policy "Users and admins can read notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users and admins can update notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Admins can create notifications"
on public.notifications
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can delete notifications"
on public.notifications
for delete
to authenticated
using (public.is_admin());
