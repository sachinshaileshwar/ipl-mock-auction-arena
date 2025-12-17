import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Target, TrendingUp, Activity, Award } from "lucide-react";

interface PlayerStats {
  matches_played?: number | null;
  total_runs?: number | null;
  total_wickets?: number | null;
  batting_average?: number | null;
  batting_strike_rate?: number | null;
  highest_score?: number | null;
  bowling_average?: number | null;
  economy_rate?: number | null;
  best_bowling?: string | null;
  stats_fetched?: boolean;
}

interface PlayerStatsCardProps {
  playerId: string;
  playerName: string;
  country: string;
  compact?: boolean;
  showTitle?: boolean;
}

export const PlayerStatsCard = ({ playerId, compact = false, showTitle = true }: PlayerStatsCardProps) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [playerId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/players/${playerId}`);
      if (data.player) {
        setStats(data.player);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg p-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (!stats || !stats.stats_fetched) {
    return (
      <div className="text-center text-muted-foreground text-sm py-2">
        No stats available
      </div>
    );
  }

  const hasBattingStats = stats.total_runs !== null || stats.batting_average !== null;
  const hasBowlingStats = stats.total_wickets !== null && stats.total_wickets > 0;

  if (compact) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg">
        {showTitle && (
          <h4 className="text-sm font-bold text-accent mb-4 flex items-center gap-2 uppercase tracking-tight">
            <Activity className="w-4 h-4" />
            IPL CAREER STATS
          </h4>
        )}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {stats.matches_played !== null && (
            <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.matches_played}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Matches</p>
            </div>
          )}
          {stats.total_runs !== null && (
            <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-2xl lg:text-3xl font-bold text-accent">{stats.total_runs}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Runs</p>
            </div>
          )}
          {stats.total_wickets !== null && (
            <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-2xl lg:text-3xl font-bold text-emerald-400">{stats.total_wickets}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Wickets</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {hasBattingStats && (
            <div className="space-y-2 bg-white/5 rounded-lg p-3 border border-white/5">
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Batting</p>
              {stats.batting_average !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">Avg</span>
                  <span className="font-bold text-white">{stats.batting_average}</span>
                </div>
              )}
              {stats.batting_strike_rate !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">SR</span>
                  <span className="font-bold text-white">{stats.batting_strike_rate}</span>
                </div>
              )}
              {stats.highest_score !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">HS</span>
                  <span className="font-bold text-white">{stats.highest_score}</span>
                </div>
              )}
            </div>
          )}
          {hasBowlingStats && (
            <div className="space-y-2 bg-white/5 rounded-lg p-3 border border-white/5">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Bowling</p>
              {stats.bowling_average !== null && stats.bowling_average > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">Avg</span>
                  <span className="font-bold text-white">{stats.bowling_average}</span>
                </div>
              )}
              {stats.economy_rate !== null && stats.economy_rate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">Eco</span>
                  <span className="font-bold text-white">{stats.economy_rate}</span>
                </div>
              )}
              {stats.best_bowling && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs">Best</span>
                  <span className="font-bold text-white">{stats.best_bowling}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Award className="w-32 h-32 text-white" />
      </div>
      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
        <Award className="w-5 h-5 text-accent" />
        IPL Career Statistics
      </h4>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        {stats.matches_played !== null && (
          <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
            <Activity className="w-4 h-4 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-white">{stats.matches_played}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Matches</p>
          </div>
        )}
        {stats.total_runs !== null && (
          <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
            <Target className="w-4 h-4 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-accent">{stats.total_runs}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Runs</p>
          </div>
        )}
        {stats.total_wickets !== null && (
          <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
            <TrendingUp className="w-4 h-4 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400">{stats.total_wickets}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Wickets</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        {/* Batting Stats */}
        {hasBattingStats && (
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-accent flex items-center gap-2 border-b border-accent/20 pb-2">
              <Target className="w-4 h-4" />
              BATTING
            </h5>
            <div className="space-y-2">
              {stats.batting_average !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Average</span>
                  <span className="font-bold text-white">{stats.batting_average}</span>
                </div>
              )}
              {stats.batting_strike_rate !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Strike Rate</span>
                  <span className="font-bold text-white">{stats.batting_strike_rate}</span>
                </div>
              )}
              {stats.highest_score !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Highest Score</span>
                  <span className="font-bold text-white">{stats.highest_score}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bowling Stats */}
        {hasBowlingStats && (
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-2">
              <TrendingUp className="w-4 h-4" />
              BOWLING
            </h5>
            <div className="space-y-2">
              {stats.bowling_average !== null && stats.bowling_average > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Average</span>
                  <span className="font-bold text-white">{stats.bowling_average}</span>
                </div>
              )}
              {stats.economy_rate !== null && stats.economy_rate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Economy</span>
                  <span className="font-bold text-white">{stats.economy_rate}</span>
                </div>
              )}
              {stats.best_bowling && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">Best Figures</span>
                  <span className="font-bold text-white">{stats.best_bowling}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};