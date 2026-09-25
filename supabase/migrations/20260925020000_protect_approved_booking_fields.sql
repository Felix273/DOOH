-- Prevent direct mutation of commercial terms after owner approval or payment.
create or replace function public.protect_approved_booking_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('approved'::public.booking_status, 'completed'::public.booking_status)
     or old.payment_status = 'paid'::public.booking_payment_status then
    if new.start_date is distinct from old.start_date
       or new.end_date is distinct from old.end_date
       or new.total_days is distinct from old.total_days
       or new.amount_subtotal is distinct from old.amount_subtotal
       or new.platform_fee is distinct from old.platform_fee
       or new.amount_total is distinct from old.amount_total
       or new.screen_id is distinct from old.screen_id
       or new.advertiser_id is distinct from old.advertiser_id then
      raise exception 'Approved or paid booking terms cannot be changed directly';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_protect_approved_fields on public.bookings;

create trigger bookings_protect_approved_fields
  before update on public.bookings
  for each row
  execute function public.protect_approved_booking_fields();
