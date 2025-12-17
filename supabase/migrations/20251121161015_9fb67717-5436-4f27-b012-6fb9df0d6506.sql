-- Create a security definer function to get email by username for sign-in
-- This allows unauthenticated users to look up emails for authentication purposes only
create or replace function public.get_email_by_username(_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where username = _username
  limit 1;
$$;

-- Grant execute permission to anon and authenticated users
grant execute on function public.get_email_by_username(text) to anon, authenticated;