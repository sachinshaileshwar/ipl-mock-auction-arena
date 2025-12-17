-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role = 'admin'::app_role
  )
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_admin(auth.uid()));