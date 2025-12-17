import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Play, Check, X, TrendingUp, Edit2, User, Users } from "lucide-react";
import { PlayerStatsCard } from "@/components/PlayerStatsCard";
import { formatCurrency, formatBidAmount, lakhsToCrores } from "@/lib/currencyUtils";
import { RecentlySoldCarousel } from "@/components/RecentlySoldCarousel";
import { BoundaryAnimation, WicketFallingAnimation, GavelAnimation, BatSwingAnimation } from "@/components/CricketAnimations";

// Fixed bid increments as requested
const BID_INCREMENTS = [
  { label: "+5 L", value: lakhsToCrores(5) },
  { label: "+20 L", value: lakhsToCrores(20) },
  { label: "+25 L", value: lakhsToCrores(25) },
  { label: "+50 L", value: lakhsToCrores(50) },
];

const LiveAuction = () => {
  const [liveRound, setLiveRound] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingBid, setEditingBid] = useState(false);
  const [customBid, setCustomBid] = useState("");
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, roundRes, playersRes] = await Promise.all([
        api.get("/api/teams"),
        api.get("/api/auction/current"),
        api.get("/api/players?status=not_started"),
      ]);

      if (teamsRes.data.teams) setTeams(teamsRes.data.teams);

      const round = roundRes.data.round;
      if (round) {
        setLiveRound(round);
        setCurrentPlayer(round.players);
      } else {
        setLiveRound(null);
        setCurrentPlayer(null);
      }

      if (playersRes.data.players) {
        setAvailablePlayers(playersRes.data.players);
        // Only set set_no if not set and we have players
        // Logic to maintain current set selection is handled by state persistence
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startNextPlayer = async () => {
    setLoading(true);
    try {
      const setPlayers = availablePlayers.filter(p => p.set_no === currentSet);
      if (setPlayers.length === 0) {
        toast({
          title: "No Players in the Crease!",
          description: "All players in current set have been auctioned",
          variant: "destructive",
        });
        return;
      }

      const randomIndex = Math.floor(Math.random() * setPlayers.length);
      const player = setPlayers[randomIndex];

      await api.post("/api/auction/start", { player_id: player.id });

      toast({ title: "🏏 Player Up for Grabs!", description: `${player.name} is now under the hammer` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const increaseBid = async (increment: number) => {
    if (!liveRound) return;

    // We update the bid directly. 
    // Backend API uses /update-bid to strictly set amount or /bid to place bid as a team.
    // The previous code updated `current_bid` on `auction_rounds` directly.
    // Backend `update-bid` route does exactly this.
    try {
      const newBid = Number(liveRound.current_bid) + increment;
      await api.post("/api/auction/update-bid", {
        round_id: liveRound.id,
        amount: newBid
      });
      toast({ title: "💰 Bid Raised!", description: `New bid: ${formatBidAmount(newBid)}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const setBidPrice = async () => {
    if (!liveRound || !customBid) return;

    const newBid = parseFloat(customBid);
    if (isNaN(newBid) || newBid < 0) {
      toast({ title: "Invalid Bid", description: "Please enter a valid bid amount", variant: "destructive" });
      return;
    }

    try {
      await api.post("/api/auction/update-bid", {
        round_id: liveRound.id,
        amount: newBid
      });

      setEditingBid(false);
      setCustomBid("");
      toast({ title: "Bid Updated", description: `Bid set to: ${formatBidAmount(newBid)}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const setLeadingTeam = async (teamId: string) => {
    if (!liveRound) return;

    try {
      // Use /bid endpoint to set team and amount (amount remains same)
      await api.post("/api/auction/bid", {
        round_id: liveRound.id,
        team_id: teamId,
        amount: liveRound.current_bid
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || err.message, variant: "destructive" });
    }
  };

  const markAsSold = async () => {
    if (!liveRound || !liveRound.current_bid_team_id) {
      toast({
        title: "Select a Franchise!",
        description: "Please select the winning franchise first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowSoldAnimation(true);

    try {
      await api.post("/api/auction/sell", { round_id: liveRound.id });

      toast({ title: "🎉 SOLD! That's a Boundary!", description: `${currentPlayer.name} sold!` });

      setTimeout(() => {
        setShowSoldAnimation(false);
        fetchData();
      }, 2000);
    } catch (error: any) {
      setShowSoldAnimation(false);
      toast({ title: "Error", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const markAsUnsold = async () => {
    if (!liveRound) return;

    setLoading(true);
    setShowUnsoldAnimation(true);

    try {
      await api.post("/api/auction/unsold", { round_id: liveRound.id });

      toast({ title: "🏏 UNSOLD - Bowled Out!", description: `${currentPlayer.name} goes back to the pavilion` });

      setTimeout(() => {
        setShowUnsoldAnimation(false);
        fetchData();
      }, 2000);
    } catch (error: any) {
      setShowUnsoldAnimation(false);
      toast({ title: "Error", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Animation Overlay
  if (showSoldAnimation) {
    return (
      <div className="fixed inset-0 z-50 bg-green-900/90 flex items-center justify-center">
        <div className="text-center space-y-6 animate-scale-in">
          <BoundaryAnimation size={200} loop={false} />
          <h1 className="text-6xl font-display font-bold text-white animate-pulse">SOLD!</h1>
          <p className="text-2xl text-green-200">That's a Six! 🏏</p>
        </div>
      </div>
    );
  }

  if (showUnsoldAnimation) {
    return (
      <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center">
        <div className="text-center space-y-6 animate-scale-in">
          <WicketFallingAnimation size={200} loop={false} />
          <h1 className="text-6xl font-display font-bold text-white animate-pulse">UNSOLD!</h1>
          <p className="text-2xl text-red-200">Clean Bowled! 🎯</p>
        </div>
      </div>
    );
  }

  return (

    <div className="space-y-6">
      {/* Recently Sold Carousel */}
      <div className="bg-black/20 rounded-xl border border-white/5 p-2 backdrop-blur-sm">
        <RecentlySoldCarousel compact={true} />
      </div>

      {/* Live Player Card mixed with Auction Controls - Split Layout */}
      {liveRound && currentPlayer ? (
        <Card className="border border-white/10 shadow-2xl overflow-hidden bg-black/40 backdrop-blur-xl">
          <CardHeader className="bg-white/5 border-b border-white/10 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-3 font-display text-white">
                <span className="animate-pulse text-3xl">🔴</span> PLAYER UNDER THE HAMMER
              </CardTitle>
              <div className="flex items-center gap-3">
                <GavelAnimation size={40} />
                <Badge variant="secondary" className="animate-pulse text-base px-4 py-1 bg-red-500/20 text-red-200 border-red-500/30">BIDDING OPEN</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* LEFT COL: Player Context (4 cols) */}
              <div className="xl:col-span-4 space-y-6">
                {/* Player Profile Card */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Photo */}
                  <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl bg-black/50">
                    {currentPlayer.photo_url ? (
                      <img src={currentPlayer.photo_url} alt={currentPlayer.name} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20"><User className="w-20 h-20" /></div>
                    )}
                  </div>

                  {/* Name & Details */}
                  <h3 className="text-3xl font-bold font-display text-white mb-2">{currentPlayer.name}</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge className="bg-white/10 text-white border-white/10">{currentPlayer.category}</Badge>
                    <Badge variant="outline" className="border-white/10 text-white/70">{currentPlayer.country}</Badge>
                    <Badge variant="outline" className="border-white/10 text-white/50">Set {currentPlayer.set_no}</Badge>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Base Price</p>
                    <p className="text-2xl font-bold text-accent font-mono">{formatCurrency(currentPlayer.base_price)}</p>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <PlayerStatsCard
                    playerId={currentPlayer.id}
                    playerName={currentPlayer.name}
                    country={currentPlayer.country}
                    compact={true}
                  />
                </div>
              </div>

              {/* RIGHT COL: Auction Controls (8 cols) */}
              <div className="xl:col-span-8 flex flex-col gap-6">

                {/* Top Row: Bid Display & Leading Team */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Current Bid HERO */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-black/60 rounded-3xl p-6 border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col justify-center items-center text-center h-full min-h-[180px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-32 h-32" /></div>
                    <p className="text-indigo-200/60 uppercase tracking-widest font-semibold mb-2 text-sm relative z-10">Current High Bid</p>

                    {editingBid ? (
                      <div className="flex items-center gap-2 relative z-10">
                        <Input
                          type="number"
                          value={customBid}
                          onChange={(e) => setCustomBid(e.target.value)}
                          className="text-4xl font-bold h-16 w-48 bg-black/40 border-indigo-500/50 text-white text-center"
                          autoFocus
                        />
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={setBidPrice} className="bg-emerald-500 text-white">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingBid(false)}>X</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 group cursor-pointer" onClick={() => { setEditingBid(true); setCustomBid(liveRound.current_bid.toString()); }}>
                        <p className="text-6xl lg:text-7xl font-bold text-white font-display tracking-tight drop-shadow-2xl">
                          {formatBidAmount(liveRound.current_bid)}
                          <Edit2 className="w-6 h-6 inline ml-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Leading Team Panel */}
                  <div className="bg-gradient-to-br from-amber-900/20 to-black/60 rounded-3xl p-6 border border-amber-500/20 flex flex-col justify-center items-center text-center relative overflow-hidden h-full min-h-[180px]">
                    <p className="text-amber-200/60 uppercase tracking-widest font-semibold mb-4 text-sm">Leading Franchise</p>
                    {liveRound.current_bid_team_id && liveRound.teams ? (
                      <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-300">
                        {liveRound.teams.logo_url ? (
                          <img src={liveRound.teams.logo_url} className="w-24 h-24 object-contain drop-shadow-xl" />
                        ) : (
                          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold text-2xl border border-amber-500/40">{liveRound.teams.short_code}</div>
                        )}
                        <div>
                          <p className="text-3xl font-bold text-white font-display leading-tight">{liveRound.teams.name}</p>
                          <p className="text-amber-400 font-mono text-sm mt-1">Purses: {formatCurrency(liveRound.teams.purse_remaining)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-white/30 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center"><Users className="w-8 h-8" /></div>
                        <p>No bids yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Actions Row (Increments + Decisions) */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                    {/* Increments */}
                    <div className="flex gap-2 flex-wrap justify-center">
                      {BID_INCREMENTS.map((increment) => (
                        <Button
                          key={increment.label}
                          onClick={() => increaseBid(increment.value)}
                          variant="outline"
                          className="bg-black/40 border-white/10 text-white hover:bg-accent hover:text-white hover:border-accent h-12 px-6 text-lg font-bold min-w-[100px]"
                        >
                          {increment.label}
                        </Button>
                      ))}
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden xl:block" />

                    {/* Sold/Unsold */}
                    <div className="flex gap-3">
                      <Button onClick={markAsSold} disabled={loading} className="h-14 px-8 text-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                        <Check className="w-6 h-6 mr-2" /> SOLD
                      </Button>
                      <Button onClick={markAsUnsold} disabled={loading} variant="destructive" className="h-14 px-8 text-xl font-bold bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20">
                        <X className="w-6 h-6 mr-2" /> UNSOLD
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Team Selector Grid */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex-1">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Select Bidder
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => setLeadingTeam(team.id)}
                        className={`group relative p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-95 flex flex-col items-center gap-1 ${liveRound.current_bid_team_id === team.id
                          ? 'border-accent bg-accent/20 ring-1 ring-accent z-10 scale-105 shadow-lg shadow-accent/20'
                          : 'border-white/10 bg-black/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                        title={`${team.name} (${formatCurrency(team.purse_remaining)})`}
                      >
                        {team.logo_url ? (
                          <img src={team.logo_url} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{team.short_code}</div>
                        )}
                        <span className={`text-[9px] font-bold truncate max-w-full ${liveRound.current_bid_team_id === team.id ? 'text-accent' : 'text-white/60 group-hover:text-white'}`}>{team.short_code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Auction Controls when no live round */
        <Card className="bg-black/40 backdrop-blur-md border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-display text-white">
              <BatSwingAnimation size={40} />
              Auction Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-white/80">Select Set</label>
              <Select value={currentSet.toString()} onValueChange={(v) => setCurrentSet(Number(v))}>
                <SelectTrigger className="h-12 text-base bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#050b14] border-white/10 text-white">
                  {Array.from(new Set(availablePlayers.map(p => p.set_no))).map(setNo => (
                    <SelectItem key={setNo} value={setNo?.toString() || "1"} className="focus:bg-white/10 focus:text-white">
                      Set {setNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={startNextPlayer} disabled={loading || availablePlayers.length === 0} className="w-full h-14 text-lg bg-accent text-white hover:bg-accent/80" size="lg">
              <Play className="w-5 h-5 mr-2" />
              Bring Player to the Crease!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Players */}
      <Card className="border border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="text-xl font-display text-white">Players in Set {currentSet} ({availablePlayers.filter(p => p.set_no === currentSet).length} waiting)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {availablePlayers.filter(p => p.set_no === currentSet).slice(0, 24).map((player) => (
              <div key={player.id} className="p-3 border border-white/10 rounded-xl hover:border-accent/50 transition-all hover:shadow-lg bg-white/5 hover:bg-white/10 hover:scale-105 cursor-pointer group">
                <p className="font-semibold text-sm truncate text-white group-hover:text-accent transition-colors">{player.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px] bg-black/20 text-white/60 border-white/10">{player.category}</Badge>
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-mono font-bold">{formatCurrency(player.base_price)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAuction;
