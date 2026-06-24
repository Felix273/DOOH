create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(current_setting('request.jwt.claim.role', true) = 'service_role', false)
    or coalesce(public.current_user_role() = 'admin', false)
$$;
