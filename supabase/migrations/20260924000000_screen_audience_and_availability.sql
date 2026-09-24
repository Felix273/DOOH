-- Add optional planning metrics and a public-safe booking availability query.
-- Availability returns dates only; advertiser, owner, payment, and campaign details remain private.

alter table public.screens
  add column if not exists daily_footfall integer,
  add column if not exists daily_impressions integer,
  add column if not exists audience_source text,
  add column if not exists audience_updated_at date;

alter table public.screens
  add constraint screens_positive_audience check (
    (daily_footfall is null or daily_footfall >= 0)
    and (daily_impressions is null or daily_impressions >= 0)
  );

create or replace function public.get_screen_booking_ranges(target_screen_id uuid)
returns table(start_date date, end_date date)
language sql
stable
security definer
set search_path = public
as $$
  select b.start_date, b.end_date
  from public.bookings b
  join public.screens s on s.id = b.screen_id
  where b.screen_id = target_screen_id
    and s.status = 'active'
    and b.status in ('pending', 'approved')
    and b.end_date >= current_date
  order by b.start_date asc;
$$;

grant execute on function public.get_screen_booking_ranges(uuid) to anon, authenticated;
