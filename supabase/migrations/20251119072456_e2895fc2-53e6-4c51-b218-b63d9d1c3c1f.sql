-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'participant');

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

-- Create enum for auction round status
CREATE TYPE public.auction_round_status AS ENUM ('live', 'completed');

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
  role app_role NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams (all authenticated users can read)
CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for profiles (users can view their own profile, admins can view all)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for players (all authenticated users can read, admins can manage)
CREATE POLICY "Anyone can view players"
  ON public.players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage players"
  ON public.players FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for auction_rounds (all authenticated users can read, admins can manage)
CREATE POLICY "Anyone can view auction rounds"
  ON public.auction_rounds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage auction rounds"
  ON public.auction_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for team_players (all authenticated users can read, admins can manage)
CREATE POLICY "Anyone can view team players"
  ON public.team_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage team players"
  ON public.team_players FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, team_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    (NEW.raw_user_meta_data->>'role')::app_role,
    (NEW.raw_user_meta_data->>'team_id')::uuid
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers for all tables
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auction_rounds_updated_at
  BEFORE UPDATE ON public.auction_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_players;

-- Create indexes for better performance
CREATE INDEX idx_players_status ON public.players(status);
CREATE INDEX idx_players_set_no ON public.players(set_no);
CREATE INDEX idx_players_sold_to_team ON public.players(sold_to_team_id);
CREATE INDEX idx_auction_rounds_status ON public.auction_rounds(status);
CREATE INDEX idx_team_players_team_id ON public.team_players(team_id);
CREATE INDEX idx_team_players_player_id ON public.team_players(player_id);
CREATE INDEX idx_profiles_team_id ON public.profiles(team_id);