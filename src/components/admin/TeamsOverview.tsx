import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Globe, ChevronDown, ChevronUp, Search, Trophy } from "lucide-react";
import { formatToLakhs } from "@/lib/currencyUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface Player {
  id: string;
  name: string;
  category: string;
  country: string;
  is_overseas: boolean;
  price: number;
  is_retained: boolean;
  photo_url: string | null;
}

interface TeamData {
  id: string;
  name: string;
  short_code: string;
  logo_url: string | null;
  purse_remaining: number;
  purse_start: number;
  max_squad_size: number;
  max_overseas: number;
  squad_count: number;
  overseas_count: number;
  retained_count: number;
  players: Player[];
}

const TeamsOverview = () => {
  const [teamsData, setTeamsData] = useState<TeamData[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [retainedFilter, setRetainedFilter] = useState<string>("all");

  useEffect(() => {
    fetchTeamsData();
    const interval = setInterval(fetchTeamsData, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamsData = async () => {
    try {
      const { data: teamsData } = await api.get("/api/teams");
      const teams = teamsData.teams || [];

      // Fetch details for each team to get players
      const teamsWithData = await Promise.all(
        teams.map(async (team: any) => {
          try {
            const { data: teamDetail } = await api.get(`/api/teams/${team.id}`);
            // Map team_players to flat player objects
            const players = (teamDetail.team.team_players || []).map((tp: any) => ({
              ...tp.players,
              price: tp.price,
              is_retained: tp.is_retained,
              sold_price: tp.price // Ensure compatibility
            }));

            const squad_count = players.length;
            const overseas_count = players.filter((p: Player) => p.is_overseas).length;
            const retained_count = players.filter((p: Player) => p.is_retained).length;

            return {
              ...team,
              squad_count,
              overseas_count,
              retained_count,
              players,
            };
          } catch (err) {
            console.error(`Failed to fetch details for team ${team.id}`, err);
            return { ...team, players: [] };
          }
        })
      );

      setTeamsData(teamsWithData);
    } catch (error) {
      console.error("Error fetching teams data:", error);
    }
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const filterPlayers = (players: Player[]) => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || player.category === categoryFilter;
      const matchesRetained = retainedFilter === "all" ||
        (retainedFilter === "retained" && player.is_retained) ||
        (retainedFilter === "bought" && !player.is_retained);

      return matchesSearch && matchesCategory && matchesRetained;
    });
  };

  const filteredTeamsData = teamsData.map(team => ({
    ...team,
    players: filterPlayers(team.players)
  })).filter(team => team.players.length > 0 || searchQuery === "");

  // Calculate overall stats
  const totalTeams = filteredTeamsData.length;
  const totalPlayers = filteredTeamsData.reduce((sum, team) => sum + team.players.length, 0);
  const totalSpent = filteredTeamsData.reduce(
    (sum, team) => sum + team.players.reduce((s, p) => s + Number(p.price), 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 backdrop-blur-md border border-indigo-500/20 text-white shadow-lg hover:border-indigo-500/40 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-indigo-400 flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-display text-white group-hover:scale-105 transition-transform origin-left">{totalTeams}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-amber-500/20 text-white shadow-lg hover:border-amber-500/40 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-display text-white group-hover:scale-105 transition-transform origin-left">{totalPlayers}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-emerald-500/20 text-white shadow-lg hover:border-emerald-500/40 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-display text-white group-hover:scale-105 transition-transform origin-left">{formatToLakhs(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search players by name or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 pl-10 h-10 transition-all duration-200 focus:bg-white/10 focus:border-accent/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white h-10">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Batsman">Batsman</SelectItem>
            <SelectItem value="Bowler">Bowler</SelectItem>
            <SelectItem value="All-rounder">All-rounder</SelectItem>
            <SelectItem value="Wicketkeeper">Wicketkeeper</SelectItem>
            <SelectItem value="Spinner">Spinner</SelectItem>
          </SelectContent>
        </Select>
        <Select value={retainedFilter} onValueChange={setRetainedFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white h-10">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="retained">Retained Only</SelectItem>
            <SelectItem value="bought">Bought Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      {filteredTeamsData.length === 0 ? (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardContent className="py-12 text-center text-white/40">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
            <p className="text-sm">Create teams to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeamsData.map((team) => {
            const filteredPlayers = filterPlayers(team.players);
            const isExpanded = expandedTeams.has(team.id);

            return (
              <Card key={team.id} className="overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:bg-black/50">
                <CardHeader
                  className="cursor-pointer hover:bg-white/5 transition-all duration-200 border-b border-white/5"
                  onClick={() => toggleTeam(team.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {team.logo_url ? (
                        <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg flex items-center justify-center">
                          <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                          <Trophy className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-2xl font-display text-white">{team.name}</CardTitle>
                        <p className="text-lg text-accent font-bold tracking-widest opacity-80">{team.short_code}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                      {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </Button>
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-2">
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Players</p>
                      <p className="text-xl font-bold text-white">{team.players.length}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Spent</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatToLakhs(team.players.reduce((sum, p) => sum + Number(p.price), 0))}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Remaining</p>
                      <p className="text-xl font-bold text-amber-400">{formatToLakhs(team.purse_remaining)}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Overseas</p>
                      <p className={`text-xl font-bold ${team.overseas_count > team.max_overseas ? 'text-red-500' : 'text-blue-400'}`}>
                        {team.overseas_count}<span className="text-white/30 text-sm">/{team.max_overseas}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-0 animate-accordion-down bg-black/20">
                    {filteredPlayers.length === 0 ? (
                      <p className="text-center text-white/30 py-6">
                        No players match your filters
                      </p>
                    ) : (
                      <div className="max-h-96 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {filteredPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0">
                                {player.photo_url ? (
                                  <img
                                    src={player.photo_url}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/20 text-xs">IMG</div>';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                                    {player.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white group-hover:text-accent transition-colors">{player.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">{player.category}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border border-white/10 ${player.is_overseas ? 'bg-indigo-500/10 text-indigo-300' : 'bg-white/5 text-white/50'}`}>
                                    {player.country}
                                  </span>
                                  {player.is_retained && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Retained</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold font-mono text-emerald-400">{formatToLakhs(player.price)}</p>
                              {player.is_retained && <p className="text-[10px] text-white/30 lowercase">retained price</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamsOverview;