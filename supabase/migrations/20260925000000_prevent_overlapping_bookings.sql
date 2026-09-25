-- Prevent two pending or approved bookings from overlapping on the same screen.
create extension if not exists btree_gist;

alter table public.bookings
  add constraint bookings_no_overlapping_active_periods
  exclude using gist (
    screen_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
  where (status in ('pending', 'approved'));
