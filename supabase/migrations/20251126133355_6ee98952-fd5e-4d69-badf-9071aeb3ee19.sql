-- Add photo_url column to players table
ALTER TABLE public.players
ADD COLUMN photo_url TEXT;

COMMENT ON COLUMN public.players.photo_url IS 'URL or path to player photo image';