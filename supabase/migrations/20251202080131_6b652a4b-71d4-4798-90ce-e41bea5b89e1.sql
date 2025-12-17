-- Add player statistics columns
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS matches_played integer,
ADD COLUMN IF NOT EXISTS total_runs integer,
ADD COLUMN IF NOT EXISTS total_wickets integer,
ADD COLUMN IF NOT EXISTS batting_average numeric(5,2),
ADD COLUMN IF NOT EXISTS batting_strike_rate numeric(5,2),
ADD COLUMN IF NOT EXISTS highest_score integer,
ADD COLUMN IF NOT EXISTS bowling_average numeric(5,2),
ADD COLUMN IF NOT EXISTS economy_rate numeric(4,2),
ADD COLUMN IF NOT EXISTS best_bowling text,
ADD COLUMN IF NOT EXISTS stats_fetched boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stats_last_updated timestamp with time zone;