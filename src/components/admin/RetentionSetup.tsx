import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/currencyUtils";

interface Team {
  id: string;
  name: string;
  purse_remaining: number;
}

interface Player {
  id: string;
  name: string;
  category: string;
  country: string;
}

const RetentionSetup = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [retentionPrice, setRetentionPrice] = useState("");
  const [retentions, setRetentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, playersRes, retainedRes] = await Promise.all([
        api.get("/api/teams"),
        api.get("/api/players?status=not_started"),
        api.get("/api/players?status=retained"),
        // Note: The original code fetched 'team_players' directly.
        // /api/players?status=retained returns Players.
        // But we need 'team_players' data (price, etc.) for the list.
        // Actually /api/players returns Player objects. 
        // sold_price is on Player object (if updated properly).
        // Let's check player.routes.js GET /.
        // It selects *. So sold_price, sold_to_team_id are available.
        // We can map this to the expected structure or simplify the UI to use Player object fields.
      ]);

      setTeams(teamsRes.data.teams || []);
      setPlayers(playersRes.data.players || []);

      // Retained players list needs to link with team name.
      // We can map retained players and lookup team name from teams list.
      const retainedPlayers = retainedRes.data.players || [];
      const teamsMap = new Map((teamsRes.data.teams || []).map((t: any) => [t.id, t.name]));

      const formattedRetentions = retainedPlayers.map((p: any) => ({
        id: p.id, // Using player ID or constructed ID
        // The UI uses retention.id for deletion. In my new endpoint I use team_id + player_id.
        // So I can pass player_id as retentionId or just pass player_id directly.
        player_id: p.id,
        team_id: p.sold_to_team_id,
        price: p.sold_price,
        players: { name: p.name, category: p.category },
        teams: { name: teamsMap.get(p.sold_to_team_id) || 'Unknown' }
      }));

      setRetentions(formattedRetentions);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!playerSearch.trim()) return players;
    const search = playerSearch.toLowerCase();
    return players.filter(player =>
      player.name.toLowerCase().includes(search) ||
      player.category.toLowerCase().includes(search) ||
      player.country.toLowerCase().includes(search)
    );
  }, [players, playerSearch]);

  const handleRetain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const price = parseFloat(retentionPrice);

      await api.post(`/api/teams/${selectedTeam}/retain`, {
        player_id: selectedPlayer,
        price: price
      });

      toast({
        title: "Player Retained",
        description: "Retention successful",
      });

      setSelectedPlayer("");
      setRetentionPrice("");
      setPlayerSearch("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modified signature to match what we have
  const handleRemoveRetention = async (teamId: string, playerId: string) => {
    if (!confirm("Remove this retention?")) return;

    try {
      await api.post("/api/teams/release", {
        team_id: teamId,
        player_id: playerId
      });

      toast({
        title: "Retention Removed",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Retention Form */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="text-white">Retain Players</CardTitle>
          <CardDescription className="text-white/60">Assign retained players to teams before auction</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleRetain} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                        {team.name} ({formatCurrency(team.purse_remaining)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-white/80">Player</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search player by name, category, or country..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus:border-accent/50 mb-2"
                    />
                  </div>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer} required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                      <SelectValue placeholder="Select player from list" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl max-h-80">
                      {filteredPlayers.length === 0 ? (
                        <div className="p-2 text-white/50 text-sm text-center">No players found</div>
                      ) : (
                        filteredPlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                            {player.name} ({player.category}) - {player.country}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Retention Price (Cr)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={retentionPrice}
                    onChange={(e) => setRetentionPrice(e.target.value)}
                    placeholder="e.g. 15.00"
                    required
                    className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 font-mono"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading || !selectedTeam || !selectedPlayer} className="w-full h-12 bg-accent hover:bg-accent/80 text-white font-bold text-lg shadow-lg shadow-accent/20">
              {loading ? "Retaining..." : "Confirm Retention"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/10 py-4">
          <CardTitle className="text-white">Retained Players ({retentions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {retentions.length === 0 ? (
            <p className="text-center text-white/30 py-12">No retentions added yet</p>
          ) : (
            <div className="divide-y divide-white/5">
              {retentions.map((retention: any) => (
                <div key={retention.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold border border-accent/30">
                      R
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-accent transition-colors">{retention.players.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5 text-[10px]">{retention.players.category}</Badge>
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 text-[10px]">{retention.teams.name}</Badge>
                        <span className="text-sm text-emerald-400 font-mono font-bold">₹{retention.price} Cr</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRetention(retention.team_id, retention.player_id)}
                    className="text-white/30 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionSetup;