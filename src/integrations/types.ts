export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      auction_rounds: {
        Row: {
          created_at: string | null
          current_bid: number
          current_bid_team_id: string | null
          id: string
          player_id: string
          status: Database["public"]["Enums"]["auction_round_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_bid: number
          current_bid_team_id?: string | null
          id?: string
          player_id: string
          status?: Database["public"]["Enums"]["auction_round_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_bid?: number
          current_bid_team_id?: string | null
          id?: string
          player_id?: string
          status?: Database["public"]["Enums"]["auction_round_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_rounds_current_bid_team_id_fkey"
            columns: ["current_bid_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_rounds_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          base_price: number
          batting_average: number | null
          batting_strike_rate: number | null
          best_bowling: string | null
          bowling_average: number | null
          category: Database["public"]["Enums"]["player_category"]
          country: string
          created_at: string | null
          economy_rate: number | null
          highest_score: number | null
          id: string
          is_overseas: boolean
          matches_played: number | null
          name: string
          photo_url: string | null
          role: string | null
          set_no: number | null
          sold_price: number | null
          sold_to_team_id: string | null
          stats_fetched: boolean | null
          stats_last_updated: string | null
          status: Database["public"]["Enums"]["player_status"]
          total_runs: number | null
          total_wickets: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          batting_average?: number | null
          batting_strike_rate?: number | null
          best_bowling?: string | null
          bowling_average?: number | null
          category: Database["public"]["Enums"]["player_category"]
          country?: string
          created_at?: string | null
          economy_rate?: number | null
          highest_score?: number | null
          id?: string
          is_overseas?: boolean
          matches_played?: number | null
          name: string
          photo_url?: string | null
          role?: string | null
          set_no?: number | null
          sold_price?: number | null
          sold_to_team_id?: string | null
          stats_fetched?: boolean | null
          stats_last_updated?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          total_runs?: number | null
          total_wickets?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          batting_average?: number | null
          batting_strike_rate?: number | null
          best_bowling?: string | null
          bowling_average?: number | null
          category?: Database["public"]["Enums"]["player_category"]
          country?: string
          created_at?: string | null
          economy_rate?: number | null
          highest_score?: number | null
          id?: string
          is_overseas?: boolean
          matches_played?: number | null
          name?: string
          photo_url?: string | null
          role?: string | null
          set_no?: number | null
          sold_price?: number | null
          sold_to_team_id?: string | null
          stats_fetched?: boolean | null
          stats_last_updated?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          total_runs?: number | null
          total_wickets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_sold_to_team_id_fkey"
            columns: ["sold_to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          team_id?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          created_at: string | null
          id: string
          is_retained: boolean
          player_id: string
          price: number
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_retained?: boolean
          player_id: string
          price: number
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_retained?: boolean
          player_id?: string
          price?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          max_overseas: number
          max_squad_size: number
          min_squad_size: number
          name: string
          purse_remaining: number
          purse_start: number
          short_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_overseas?: number
          max_squad_size?: number
          min_squad_size?: number
          name: string
          purse_remaining?: number
          purse_start?: number
          short_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_overseas?: number
          max_squad_size?: number
          min_squad_size?: number
          name?: string
          purse_remaining?: number
          purse_start?: number
          short_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_username: { Args: { _username: string }; Returns: string }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "participant"
      auction_round_status: "live" | "completed"
      player_category:
        | "Batsman"
        | "Bowler"
        | "All-rounder"
        | "Wicketkeeper"
        | "Spinner"
      player_status: "not_started" | "live" | "sold" | "unsold" | "retained"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "participant"],
      auction_round_status: ["live", "completed"],
      player_category: [
        "Batsman",
        "Bowler",
        "All-rounder",
        "Wicketkeeper",
        "Spinner",
      ],
      player_status: ["not_started", "live", "sold", "unsold", "retained"],
    },
  },
} as const
