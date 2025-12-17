import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, parseCurrency } from "@/lib/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Player {
  id: string;
  name: string;
  category: string;
  role: string | null;
  country: string;
  is_overseas: boolean;
  base_price: number;
  set_no: number | null;
  status: string;
  photo_url: string | null;
}

const PlayersManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data } = await api.get("/api/players");
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const getCategoryFromSpecialism = (specialism: string): string => {
    const spec = specialism?.toUpperCase() || "";
    if (spec.includes("WICKET") || spec.includes("WK")) return "Wicketkeeper";
    if (spec.includes("FAST") || spec.includes("PACE")) return "Bowler";
    if (spec.includes("SPIN")) return "Spinner";
    if (spec.includes("ALL") || spec.includes("ROUNDER")) return "All-rounder";
    if (spec.includes("BAT")) return "Batsman";
    return "All-rounder";
  };

  const getCategoryFromSet = (setCode: string): string => {
    const code = setCode.toUpperCase();
    if (code.startsWith('M')) return 'All-rounder';
    if (code.startsWith('B')) return 'Batsman';
    if (code.startsWith('AL') || code.startsWith('UAL')) return 'All-rounder';
    if (code.startsWith('WK') || code.startsWith('UWK')) return 'Wicketkeeper';
    if (code.startsWith('FB') || code.startsWith('UFB')) return 'Bowler';
    if (code.startsWith('SB') || code.startsWith('USB')) return 'Spinner';
    if (code.startsWith('UB')) return 'Batsman';
    if (code.startsWith('OG')) {
      if (code.includes('AL')) return 'All-rounder';
      if (code.includes('WK')) return 'Wicketkeeper';
      if (code.includes('FB')) return 'Bowler';
      if (code.includes('SB')) return 'Spinner';
      return 'Batsman';
    }
    return 'All-rounder';
  };

  const parseNumber = (value: string | undefined): number | null => {
    if (!value || value.trim() === "" || value === "0") return null;
    const num = parseFloat(value.replace(/,/g, ""));
    return isNaN(num) ? null : num;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file must contain headers and at least one player");
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, ''));

        const playersToInsert: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Skip header/category rows (e.g., "MARQUEE SET 1")
          if (line.toUpperCase().includes("SET") && !line.includes(",")) continue;
          if (line.split(",").filter(v => v.trim()).length < 3) continue;

          const values = line.split(",").map(v => v.trim());
          const player: any = {};

          headers.forEach((header, index) => {
            const value = values[index];
            if (header === "first_name") player.firstName = value;
            if (header === "surname") player.surname = value;
            if (header === "set_no" || header === "2025_set") player.set = value;
            if (header === "country") player.country = value;
            if (header === "specialism") player.specialism = value;
            if (header === "previous_ipl_team") player.role = value || null;
            if (header === "reserve_price_in_lakhs") {
              player.base_price = parseCurrency(value);
            }
            if (header === "photo_url" || header === "photo") player.photo_url = value || null;
            // Stats columns
            if (header === "no.of_matches_played" || header === "matches_played") {
              player.matches_played = parseNumber(value);
            }
            if (header === "no.of_runs" || header === "total_runs") {
              player.total_runs = parseNumber(value);
            }
            if (header === "no.of_wickets" || header === "total_wickets") {
              player.total_wickets = parseNumber(value);
            }
            if (header === "batting_avg." || header === "batting_average") {
              player.batting_average = parseNumber(value);
            }
            if (header === "strike_rate" || header === "batting_strike_rate") {
              player.batting_strike_rate = parseNumber(value);
            }
            if (header === "highest_score") {
              player.highest_score = parseNumber(value);
            }
            if (header === "bowling_avg." || header === "bowling_average") {
              player.bowling_average = parseNumber(value);
            }
            if (header === "bowling_economy" || header === "economy_rate") {
              player.economy_rate = parseNumber(value);
            }
            if (header === "best_bowling") {
              player.best_bowling = value || null;
            }
          });

          // Combine first name and surname
          player.name = `${player.firstName || ''} ${player.surname || ''}`.trim();

          // Validation
          if (!player.firstName && !player.surname) {
            continue; // Skip empty rows
          }
          if (!player.country) {
            errors.push(`Line ${i + 1}: Missing country for ${player.name}`);
            continue;
          }
          if (isNaN(player.base_price) || player.base_price <= 0) {
            errors.push(`Line ${i + 1}: Invalid reserve price for ${player.name}`);
            continue;
          }

          // Determine category from specialism or set code
          if (player.specialism) {
            player.category = getCategoryFromSpecialism(player.specialism);
          } else if (player.set) {
            player.category = getCategoryFromSet(player.set);
          } else {
            player.category = 'All-rounder';
          }

          // Extract set number
          if (player.set) {
            const setMatch = player.set.match(/\d+/);
            player.set_no = setMatch ? parseInt(setMatch[0]) : null;
          } else {
            player.set_no = null;
          }

          player.is_overseas = player.country?.toLowerCase() !== "india";
          player.status = "not_started";

          // Mark stats as fetched if we have any stats data
          if (player.matches_played !== null || player.total_runs !== null || player.total_wickets !== null) {
            player.stats_fetched = true;
            player.stats_last_updated = new Date().toISOString();
          }

          // Clean up temporary fields
          delete player.firstName;
          delete player.surname;
          delete player.set;
          delete player.specialism;

          playersToInsert.push(player);
        }

        if (errors.length > 0) {
          console.warn("Import warnings:", errors);
        }

        if (playersToInsert.length === 0) {
          throw new Error("No valid players found in CSV");
        }

        // Use Bulk Insert API
        await api.post("/api/players/bulk", { players: playersToInsert });

        toast({
          title: "Players Imported Successfully",
          description: `Imported ${playersToInsert.length} players with stats from auction list`,
        });

        fetchPlayers();
      } catch (error: any) {
        toast({
          title: "Import Error",
          description: error.response?.data?.error || error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL players? This will also reset all team purses. This cannot be undone.")) return;

    setLoading(true);
    try {
      await api.delete("/api/players/all");

      toast({
        title: "All Players Deleted",
        description: "All players removed and team purses reset to original amounts",
      });

      fetchPlayers();
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

  const downloadTemplate = () => {
    const csvContent = `Sl.No.,Set No.,2025 Set,First Name,Surname,Country,Specialism,Previous IPL Team,Reserve Price (in lakhs),NO.OF MATCHES PLAYED,NO.OF RUNS,BATTING AVG.,STRIKE RATE,NO.OF WICKETS,BOWLING AVG.,BOWLING ECONOMY,Photo URL
1,1,M1,ARSHDEEP,SINGH,INDIA,FAST BOWLER,PBKS,200,65,29,5.8,72.5,76,27,9.03,
2,1,M1,PAT,CUMMINS,AUSTRALIA,FAST BOWLER,SRH,200,58,515,19.81,149.71,63,30.52,8.75,
3,2,B1,RINKU,SINGH,INDIA,BATSMAN,KKR,200,45,893,30.79,143.34,0,0,0,`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auction_players_template.csv";
    a.click();
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Import Card */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent" />
            Import Players
          </CardTitle>
          <CardDescription className="text-white/60">Upload a CSV file with player data and IPL statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <label htmlFor="file-upload" className="flex-1 max-w-[200px]">
              <div className={`cursor-pointer h-12 flex items-center justify-center gap-2 rounded-xl transition-all ${loading
                  ? "bg-accent/50 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/80 hover:shadow-lg hover:shadow-accent/20"
                } text-white font-semibold text-sm`}>
                <Upload className="w-4 h-4" />
                {loading ? "Uploading..." : "Upload CSV"}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>

            <Button variant="outline" onClick={downloadTemplate} className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/30">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            {players.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteAll} className="h-12 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 ml-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Players
              </Button>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50 space-y-2 border border-white/5">
            <p><strong className="text-white/80">Required columns:</strong> First Name, Surname, Country, 2025 Set, Reserve Price (in lakhs)</p>
            <p><strong className="text-white/80">Stats columns:</strong> NO.OF MATCHES PLAYED, NO.OF RUNS, BATTING AVG., STRIKE RATE, NO.OF WICKETS, BOWLING AVG., BOWLING ECONOMY</p>
            <p><strong className="text-white/80">Optional columns:</strong> Previous IPL Team, Specialism, Photo URL</p>
            <p><strong className="text-white/80">Price formats:</strong> Supports "200" (lakhs), "2.00 Cr", "50 Lakhs"</p>
          </div>
        </CardContent>
      </Card>

      {/* Players List Card */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/10 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">Players List ({players.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-accent/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <Upload className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">No players imported yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/60 font-medium">Name</TableHead>
                    <TableHead className="text-white/60 font-medium">Category</TableHead>
                    <TableHead className="text-white/60 font-medium">Country</TableHead>
                    <TableHead className="text-white/60 font-medium">Set</TableHead>
                    <TableHead className="text-white/60 font-medium text-right">Base Price</TableHead>
                    <TableHead className="text-white/60 font-medium text-center">Stats</TableHead>
                    <TableHead className="text-white/60 font-medium text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-semibold text-white group-hover:text-accent transition-colors">
                        {player.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-white/70 bg-white/5">{player.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={player.is_overseas ? "secondary" : "outline"} className={player.is_overseas ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30" : "border-white/10 text-white/70 bg-white/5"}>
                          {player.country}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{player.set_no || "-"}</TableCell>
                      <TableCell className="text-white/90 font-mono text-right">{formatCurrency(player.base_price)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400 bg-emerald-500/10">
                          ✓ Loaded
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`
                            ${player.status === "sold" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                              player.status === "live" ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse" :
                                "bg-white/5 text-white/50 border-white/10"}
                          `}
                          variant="outline"
                        >
                          {player.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; export default PlayersManagement;