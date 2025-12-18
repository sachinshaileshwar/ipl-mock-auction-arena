import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatBidAmount, formatToLakhs } from "@/lib/currencyUtils";
import { PlayerStatsCard } from "@/components/PlayerStatsCard";
import CricketLoader from "@/components/CricketLoader";
import { TrophyAnimation, BatSwingAnimation } from "@/components/CricketAnimations";
import { RecentlySoldCarousel } from "@/components/RecentlySoldCarousel";
import { TrendingUp, Users, DollarSign, Activity, Gavel } from "lucide-react";

// Micro-Component for Stats Tile
const StatTile = ({ icon: Icon, label, value, subtext, colorClass }: any) => (
  <div className={`relative overflow-hidden rounded-2xl p-4 border border-white/10 backdrop-blur-md bg-gradient-to-br ${colorClass} shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all`}>
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
      <Icon size={60} />
    </div>
    <div className="relative z-10">
      <div className="p-2 bg-white/10 w-fit rounded-lg mb-3">
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl lg:text-3xl font-display font-bold text-white mt-1">{value}</p>
      {subtext && <p className="text-[10px] text-white/60 mt-1">{subtext}</p>}
    </div>
  </div>
);

const PublicAuctionView = () => {
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);
  const [lastCompletedRoundId, setLastCompletedRoundId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Polling faster (1s) for sync
    return () => clearInterval(interval);
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [teamsRes, roundRes, soldRes, historyRes] = await Promise.all([
        api.get("/api/teams"),
        api.get("/api/auction/current"),
        api.get("/api/auction/recently-sold"),
        api.get("/api/auction/history?limit=1")
      ]);

      if (teamsRes.data.teams) {
        setTeams(teamsRes.data.teams);
      }

      if (soldRes.data.players) {
        const soldPlayers = soldRes.data.players || [];
        // Filter only actually sold players for stats
        const actuallySold = soldPlayers.filter((p: any) => p.status === 'sold');
        const totalSpent = actuallySold.reduce((sum: number, p: any) => sum + Number(p.sold_price || 0), 0);
        const maxBid = Math.max(...actuallySold.map((p: any) => Number(p.sold_price || 0)), 0);
        setStats({
          totalSpent,
          highestBid: maxBid,
          soldCount: actuallySold.length
        });
      }

      const round = roundRes.data.round;
      if (round) {
        setLiveRound(round);
        setCurrentPlayer(round.players);
      } else {
        setLiveRound(null);
        setCurrentPlayer(null);
      }

      // Check for new completed round to trigger animation
      const latestHistory = historyRes.data.rounds?.[0];
      if (latestHistory && latestHistory.id !== lastCompletedRoundId) {
        // Avoid triggering on first load if it's old
        const isRecent = new Date(latestHistory.updated_at).getTime() > Date.now() - 10000; // Only if within last 10s

        if (lastCompletedRoundId !== null && isRecent) {
          const playerStatus = latestHistory.players?.status;
          if (playerStatus === 'sold') {
            setShowSoldAnimation(true);
            setTimeout(() => setShowSoldAnimation(false), 3000);
          } else if (playerStatus === 'unsold') {
            setShowUnsoldAnimation(true);
            setTimeout(() => setShowUnsoldAnimation(false), 3000);
          }
        }
        setLastCompletedRoundId(latestHistory.id);
      }

    } catch (error) {
      console.error("Error fetching auction data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] bg-gradient-stadium cricket-pattern">
        <CricketLoader size={150} message="Initializing Arena..." />
      </div>
    );
  }

  // Calculate some derived stats
  const totalPurseRemaining = teams.reduce((sum, t) => sum + (t.purse_remaining || 0), 0);

  // Animation Overlay
  if (showSoldAnimation) {
    return (
      <div className="fixed inset-0 z-50 bg-green-900/90 flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center space-y-6 animate-scale-in">
          <div className="flex justify-center"><TrophyAnimation size={200} /></div>
          <h1 className="text-7xl md:text-9xl font-display font-black text-white animate-pulse drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">SOLD!</h1>
          <p className="text-3xl md:text-4xl text-green-200 font-bold uppercase tracking-widest">To {liveRound?.teams?.name || "The Franchise"}</p>
        </div>
      </div>
    );
  }

  if (showUnsoldAnimation) {
    return (
      <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center space-y-6 animate-scale-in">
          <div className="flex justify-center"><BatSwingAnimation size={200} /></div>
          <h1 className="text-7xl md:text-9xl font-display font-black text-white animate-pulse drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">UNSOLD</h1>
          <p className="text-3xl md:text-4xl text-red-200 font-bold uppercase tracking-widest">Better Luck Next Time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c4e] via-[#050b14] to-black text-white flex flex-col p-4 md:p-6 overflow-hidden font-sans selection:bg-accent selection:text-accent-foreground">

      {/* Top Bar - Minimal Header */}
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse-glow">
            <span className="text-xl">🏏</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              IPL AUCTION <span className="text-accent">2025</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-white/5 border-white/10 px-4 py-2 text-xs tracking-widest backdrop-blur-sm">
            LIVE PROJECTOR VIEW
          </Badge>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 min-h-0">

        {/* COL 1: FRANCHISE LIST (Left Sidebar) - 3 Cols x 12 Rows */}
        <div className="hidden lg:block col-span-3 row-span-12 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl -z-10 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <Card className="h-full border-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
              <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center gap-2">
                <Users size={16} /> FRANCHISE STANDINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
              <div className="divide-y divide-white/5">
                {teams.sort((a, b) => b.purse_remaining - a.purse_remaining).map((team, index) => (
                  <div key={team.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-4">{index + 1}</span>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center p-1">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs">{team.short_code?.substring(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none text-white group-hover/item:text-accent transition-colors">{team.short_code}</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">{team.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-emerald-400">{formatToLakhs(team.purse_remaining)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COL 2: MAIN STAGE (Center) - 6 Cols x 9 Rows */}
        <div className="col-span-12 lg:col-span-6 row-span-9 relative">
          {liveRound ? (
            <div className="h-full rounded-3xl overflow-hidden border border-accent/20 bg-gradient-to-br from-[#1a1f35] to-[#0f1219] shadow-2xl relative flex flex-col group">
              {/* Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-red-500/80 hover:bg-red-500 text-white border-0 shadow-lg shadow-red-500/20 animate-pulse px-3 py-1">
                  ● LIVE BIDDING
                </Badge>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                {/* Player Image/Avatar */}
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-accent/30 shadow-[0_0_50px_rgba(var(--accent),0.3)] mb-6 overflow-hidden bg-black/40 flex items-center justify-center relative">
                  {currentPlayer?.photo_url ? (
                    <img src={currentPlayer.photo_url} alt={currentPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">👤</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <h2 className="text-4xl md:text-6xl font-display font-bold text-center text-white mb-2 leading-tight">
                  {currentPlayer?.name}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">{currentPlayer?.category}</Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">{currentPlayer?.country}</Badge>
                </div>

                {/* Expanded Player Stats - Moved Up for Visibility */}
                <div className="w-full max-w-4xl mb-6">
                  <PlayerStatsCard
                    playerId={currentPlayer.id}
                    playerName={currentPlayer.name}
                    country={currentPlayer.country}
                    compact={true}
                    showTitle={false}
                  />
                </div>

                {/* Main Bid Counter - Horizontal Layout */}
                <div className="w-full bg-gradient-to-r from-white/10 to-black/40 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] p-4 lg:p-6 flex flex-row items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] gap-4">

                  {/* Left: Bid Amount */}
                  <div className="flex-1 flex flex-col items-center lg:items-start border-r border-white/10 pr-4">
                    <p className="text-xs lg:text-xs uppercase tracking-[0.4em] text-accent/80 mb-1 font-bold text-shadow">Current Bid</p>
                    <p className="text-5xl lg:text-7xl font-display font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                      {formatBidAmount(liveRound.current_bid)}
                    </p>
                  </div>

                  {/* Right: Leading Team */}
                  <div className="flex-1 flex flex-col items-center justify-center pl-4">
                    {liveRound.teams ? (
                      <div className="flex flex-col items-center gap-1 animate-fade-in w-full">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">HELD BY</span>
                        <div className="flex items-center gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/10 shadow-inner w-full justify-center">
                          {liveRound.teams.logo_url && (
                            <div className="w-10 h-10 bg-white rounded-full p-1 flex items-center justify-center shadow-lg shrink-0">
                              <img src={liveRound.teams.logo_url} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <span className="font-display font-black text-2xl lg:text-4xl text-accent tracking-wide whitespace-nowrap">{liveRound.teams.short_code}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 w-full opacity-50">
                        <p className="text-sm text-white/50 italic text-center">Waiting for<br />opening bid...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* IDLE STATE */
            <div className="h-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center p-8 text-center relative">
              <div className="absolute inset-0 opacity-20 bg-[url('/pattern.png')] bg-repeat"></div>
              <TrophyAnimation size={140} />
              <h2 className="text-4xl font-display font-bold mt-6 mb-2">WAITING FOR NEXT SET</h2>
              <p className="text-muted-foreground text-lg max-w-md">The auctioneer is preparing the next set of players. Stay tuned.</p>
            </div>
          )}
        </div>

        {/* COL 3: STATS GRID (Right) - 3 Cols x 9 Rows */}
        <div className="hidden lg:flex col-span-3 row-span-9 flex-col gap-4">
          {/* Top Stats */}
          <div className="grid grid-rows-3 gap-4 h-full">
            <StatTile
              icon={DollarSign}
              label="Total Spent"
              value={formatToLakhs(stats.totalSpent)}
              colorClass="from-blue-600/20 to-indigo-600/5 hover:border-blue-500/40"
            />
            <StatTile
              icon={TrendingUp}
              label="Highest Bid"
              value={formatToLakhs(stats.highestBid)}
              subtext="Record Breaker"
              colorClass="from-purple-600/20 to-pink-600/5 hover:border-purple-500/40"
            />
            <StatTile
              icon={Gavel}
              label="Sold Players"
              value={stats.soldCount}
              subtext="Cricketers Sold"
              colorClass="from-amber-600/20 to-orange-600/5 hover:border-amber-500/40"
            />
          </div>
        </div>

        {/* BOTTOM ROW: CAROUSEL (Spans Center+Right) - 9 Cols x 3 Rows */}
        <div className="col-span-12 lg:col-span-9 row-span-3 relative group rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="absolute top-0 left-0 bg-accent/10 px-4 py-1 rounded-br-2xl text-[10px] font-bold tracking-widest text-accent z-10 border-r border-b border-accent/20">
            JUST SOLD
          </div>
          <div className="h-full p-2 flex items-center">
            <div className="w-full">
              <RecentlySoldCarousel compact />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PublicAuctionView;
