create or replace function public.reject_booking_reschedule(p_request_id uuid)
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
  where id = request_row.booking_id;

  if not (public.is_admin() or public.owns_screen(booking_row.screen_id)) then
    raise exception 'Only the media owner or an admin can reject reschedules';
  end if;

  if request_row.status <> 'pending'::public.booking_reschedule_status then
    raise exception 'Only pending reschedule requests can be rejected';
  end if;

  update public.booking_reschedule_requests
  set status = 'rejected'::public.booking_reschedule_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = request_row.id;

  return 'rejected'::public.booking_reschedule_status;
end;
$$;

grant execute on function public.reject_booking_reschedule(uuid) to authenticated;
