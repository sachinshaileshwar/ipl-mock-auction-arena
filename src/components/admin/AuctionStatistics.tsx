import { useEffect, useState } from "react";
import api from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Users, DollarSign } from "lucide-react";
import { formatToLakhs } from "@/lib/currencyUtils";

const AuctionStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    teamSpending: any[];
    expensivePlayers: any[];
    categoryDistribution: any[];
    totalSpent: number;
  }>({
    teamSpending: [],
    expensivePlayers: [],
    categoryDistribution: [],
    totalSpent: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const res = await api.get("/api/auction/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load auction statistics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-muted-foreground py-10">
        Loading auction statistics...
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/70">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold font-display text-white">
              {formatToLakhs(stats.totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/70">
              <Users className="w-4 h-4 text-indigo-400" />
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold font-display text-white">
              {stats.teamSpending.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/70">
              <Trophy className="w-4 h-4 text-amber-400" />
              Players Sold
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold font-display text-white">
              {stats.teamSpending.reduce(
                (sum, t: any) => sum + t.players,
                0
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Spending */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-accent" />
              Team Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {stats.teamSpending.map((team: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">{team.name}</p>
                    <p className="text-xs text-white/50">
                      {team.players} players
                    </p>
                  </div>
                  <p className="font-bold text-accent font-mono">
                    {formatToLakhs(team.total)}
                  </p>
                </div>
              ))}

              {stats.teamSpending.length === 0 && (
                <p className="text-center text-white/30 py-8">
                  No spending data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expensive Players */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-amber-400" />
              Most Expensive Players
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {stats.expensivePlayers.map((player: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-accent transition-colors">{player.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] border-white/10 text-white/60 bg-white/5">
                        {player.category}
                      </Badge>
                      <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                        {player.team}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold text-emerald-400 font-mono text-lg">
                    {formatToLakhs(player.sold_price)}
                  </p>
                </div>
              ))}

              {stats.expensivePlayers.length === 0 && (
                <p className="text-center text-white/30 py-8">
                  No players sold yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="text-white">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.categoryDistribution.map((cat: any, index: number) => (
              <div
                key={index}
                className="text-center p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <p className="text-3xl font-bold text-accent mb-2">
                  {cat.count}
                </p>
                <p className="text-xs uppercase tracking-wider text-white/50 font-medium">
                  {cat.category}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionStatistics;



