-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true);

-- Create RLS policies for team logos
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

CREATE POLICY "Admins can upload team logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'team-logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update team logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'team-logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete team logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'team-logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::app_role
  )
);