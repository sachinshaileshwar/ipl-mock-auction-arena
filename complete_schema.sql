-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'participant', 'team');

-- Create enum for player categories
CREATE TYPE public.player_category AS ENUM (
  'Batsman',
  'Bowler',
  'All-rounder',
  'Wicketkeeper',
  'Spinner'
);

-- Create enum for player status
CREATE TYPE public.player_status AS ENUM (
  'not_started',
  'live',
  'sold',
  'unsold',
  'retained'
);

-- Create enum for auction_round_status
CREATE TYPE public.auction_round_status AS ENUM ('live', 'completed');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  purse_start DECIMAL(10, 2) NOT NULL DEFAULT 90.00,
  purse_remaining DECIMAL(10, 2) NOT NULL DEFAULT 90.00,
  min_squad_size INTEGER NOT NULL DEFAULT 11,
  max_squad_size INTEGER NOT NULL DEFAULT 25,
  max_overseas INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role app_role NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table (merged with all updates)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category player_category NOT NULL,
  role TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  is_overseas BOOLEAN NOT NULL DEFAULT FALSE,
  base_price DECIMAL(10, 2) NOT NULL,
  set_no INTEGER,
  status player_status NOT NULL DEFAULT 'not_started',
  sold_price DECIMAL(10, 2),
  sold_to_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  photo_url TEXT,
  -- Stats Columns
  matches_played integer,
  total_runs integer,
  total_wickets integer,
  batting_average numeric(5,2),
  batting_strike_rate numeric(5,2),
  highest_score integer,
  bowling_average numeric(5,2),
  economy_rate numeric(4,2),
  best_bowling text,
  stats_fetched boolean DEFAULT false,
  stats_last_updated timestamp with time zone,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON COLUMN public.players.photo_url IS 'URL or path to player photo image';

-- Create auction_rounds table
CREATE TABLE public.auction_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  current_bid DECIMAL(10, 2) NOT NULL,
  current_bid_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status auction_round_status NOT NULL DEFAULT 'live',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_players table (squad management and retention)
CREATE TABLE public.team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_retained BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- ==========================================
-- 3. STORAGE & BUCKETS
-- ==========================================
-- Insert bucket if not exists (idempotent usually requires function, but direct insert works in fresh DB)
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;

-- Helper function for Admin checks
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

-- Helper function for Email Lookup (Auth)
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select email
  from public.profiles
  where username = _username
  limit 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;

-- Policies: Teams
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies: Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- Policies: Players
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage players" ON public.players FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies: Auction Rounds
CREATE POLICY "Anyone can view auction rounds" ON public.auction_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage auction rounds" ON public.auction_rounds FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies: Team Players
CREATE POLICY "Anyone can view team players" ON public.team_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage team players" ON public.team_players FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies: Storage
CREATE POLICY "Anyone can view team logos" ON storage.objects FOR SELECT USING (bucket_id = 'team-logos');
CREATE POLICY "Admins can upload team logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'team-logos' AND public.is_admin(auth.uid())
);
CREATE POLICY "Admins can update team logos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'team-logos' AND public.is_admin(auth.uid())
);
CREATE POLICY "Admins can delete team logos" ON storage.objects FOR DELETE USING (
  bucket_id = 'team-logos' AND public.is_admin(auth.uid())
);

-- ==========================================
-- 5. TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, team_id, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'participant'::app_role),
    (NEW.raw_user_meta_data->>'team_id')::uuid,
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auction_rounds_updated_at BEFORE UPDATE ON public.auction_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 6. REALTIME
-- ==========================================
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_players;

-- ==========================================
-- 7. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_players_status ON public.players(status);
CREATE INDEX IF NOT EXISTS idx_players_set_no ON public.players(set_no);
CREATE INDEX IF NOT EXISTS idx_players_sold_to_team ON public.players(sold_to_team_id);
CREATE INDEX IF NOT EXISTS idx_auction_rounds_status ON public.auction_rounds(status);
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON public.team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_player_id ON public.team_players(player_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
