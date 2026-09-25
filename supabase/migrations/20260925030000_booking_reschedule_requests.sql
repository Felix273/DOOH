-- Owner-approved rescheduling for approved bookings.
-- Requests preserve the original campaign duration and commercial terms.
create type public.booking_reschedule_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table public.booking_reschedule_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  advertiser_id uuid not null references public.profiles(id) on delete cascade,
  proposed_start_date date not null,
  proposed_end_date date not null,
  reason text,
  status public.booking_reschedule_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reschedule_request_valid_dates check (proposed_end_date >= proposed_start_date)
);

create unique index booking_reschedule_one_pending
  on public.booking_reschedule_requests (booking_id)
  where status = 'pending';

create or replace function public.validate_reschedule_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_row public.bookings%rowtype;
  proposed_days integer;
begin
  select * into booking_row
  from public.bookings
  where id = new.booking_id;

  if not found then
    raise exception 'Booking not found';
  end if;

  if booking_row.advertiser_id <> new.advertiser_id then
    raise exception 'Reschedule requester does not own the booking';
  end if;

  if booking_row.status <> 'approved'::public.booking_status then
    raise exception 'Only approved bookings can be rescheduled';
  end if;

  if current_date > booking_row.start_date then
    raise exception 'Bookings cannot be rescheduled after the campaign starts';
  end if;

  proposed_days := new.proposed_end_date - new.proposed_start_date + 1;

  if proposed_days <> booking_row.total_days then
    raise exception 'Rescheduling must preserve the original campaign duration';
  end if;

  if new.proposed_start_date < current_date then
    raise exception 'Reschedule dates must be today or later';
  end if;

  return new;
end;
$$;

create trigger reschedule_requests_validate
  before insert or update on public.booking_reschedule_requests
  for each row
  execute function public.validate_reschedule_request();

create or replace function public.approve_booking_reschedule(p_request_id uuid)
returns public.booking_reschedule_status
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.booking_reschedule_requests%rowtype;
  booking_row public.bookings%rowtype;
begin
  select * into request_row
  from public.booking_reschedule_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Reschedule request not found';
  end if;

  select * into booking_row
  from public.bookings
  where id = request_row.booking_id
  for update;

  if not (public.is_admin() or public.owns_screen(booking_row.screen_id)) then
    raise exception 'Only the media owner or an admin can approve reschedules';
  end if;

  if request_row.status <> 'pending'::public.booking_reschedule_status then
    raise exception 'Only pending reschedule requests can be approved';
  end if;

  if booking_row.status <> 'approved'::public.booking_status then
    raise exception 'The booking is no longer eligible for rescheduling';
  end if;

  if current_date > booking_row.start_date then
    raise exception 'Bookings cannot be rescheduled after the campaign starts';
  end if;

  update public.bookings
  set start_date = request_row.proposed_start_date,
      end_date = request_row.proposed_end_date,
      updated_at = now()
  where id = booking_row.id;

  update public.booking_reschedule_requests
  set status = 'approved'::public.booking_reschedule_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = request_row.id;

  return 'approved'::public.booking_reschedule_status;
end;
$$;

grant execute on function public.approve_booking_reschedule(uuid) to authenticated;

alter table public.booking_reschedule_requests enable row level security;

create policy "Booking participants can read reschedule requests"
on public.booking_reschedule_requests
for select
to authenticated
using (
  advertiser_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.bookings
    where bookings.id = booking_reschedule_requests.booking_id
      and public.owns_screen(bookings.screen_id)
  )
);

create policy "Advertisers can create reschedule requests"
on public.booking_reschedule_requests
for insert
to authenticated
with check (
  advertiser_id = auth.uid()
  and public.current_user_role() in ('advertiser', 'admin')
);
