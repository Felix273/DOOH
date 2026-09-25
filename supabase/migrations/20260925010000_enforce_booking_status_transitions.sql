-- Enforce the booking lifecycle and actor permissions at the database level.
create or replace function public.validate_booking_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  -- Advertisers may cancel their own pending bookings.
  if old.status = 'pending'::public.booking_status
     and new.status = 'cancelled'::public.booking_status
     and old.advertiser_id = auth.uid() then
    return new;
  end if;

  -- Media owners may approve or reject pending bookings for their screens.
  if old.status = 'pending'::public.booking_status
     and new.status in (
       'approved'::public.booking_status,
       'rejected'::public.booking_status
     )
     and public.owns_screen(old.screen_id) then
    return new;
  end if;

  -- Advertisers may cancel approved bookings before the campaign starts.
  if old.status = 'approved'::public.booking_status
     and new.status = 'cancelled'::public.booking_status
     and old.advertiser_id = auth.uid() then
    if current_date > old.start_date then
      raise exception 'Approved bookings cannot be cancelled after the campaign start date';
    end if;

    return new;
  end if;

  -- Media owners may mark an approved campaign completed after its end date.
  if old.status = 'approved'::public.booking_status
     and new.status = 'completed'::public.booking_status
     and public.owns_screen(old.screen_id) then
    if current_date < old.end_date then
      raise exception 'A booking cannot be completed before its end date';
    end if;

    return new;
  end if;

  raise exception 'You are not allowed to change booking status from % to %',
    old.status,
    new.status;
end;
$$;

drop trigger if exists bookings_validate_status_transition on public.bookings;

create trigger bookings_validate_status_transition
  before update of status on public.bookings
  for each row
  execute function public.validate_booking_status_transition();
