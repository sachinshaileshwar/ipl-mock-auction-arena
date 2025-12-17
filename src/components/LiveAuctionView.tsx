import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Users, Trophy, DollarSign, User } from "lucide-react";
import { formatCurrency, formatBidAmount } from "@/lib/currencyUtils";
import { PlayerStatsCard } from "@/components/PlayerStatsCard";
import { RecentlySoldCarousel } from "@/components/RecentlySoldCarousel";
import { TrophyAnimation, GavelAnimation, BatSwingAnimation } from "@/components/CricketAnimations";

const LiveAuctionView = () => {
  const [liveRound, setLiveRound] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, roundRes] = await Promise.all([
        api.get("/api/teams"),
        api.get("/api/auction/current"),
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
    } catch (error) {
      console.error("Error fetching live auction data:", error);
    }
  };



  if (!liveRound || !currentPlayer) {
    return (
      <div className="space-y-6">
        <RecentlySoldCarousel />
        <Card className="border border-white/10 bg-black/40 backdrop-blur-md">
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-4 opacity-50">
              <TrophyAnimation size={120} />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2 text-white">Waiting for Next Player</h3>
            <p className="text-white/60">The auction is paused. Stay tuned for the next cricketer!</p>
            <div className="flex justify-center gap-6 mt-6 opacity-30 text-white">
              <BatSwingAnimation size={60} />
              <GavelAnimation size={60} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recently Sold Carousel */}
      <RecentlySoldCarousel />

      {/* Live Player Card */}
      <Card className="border border-secondary/50 shadow-2xl overflow-hidden bg-black/60 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 pointer-events-none" />

        <CardHeader className="bg-gradient-to-r from-secondary/20 to-secondary/5 border-b border-secondary/30 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-display flex items-center gap-3 text-white">
              <span className="animate-pulse text-3xl">🔴</span> LIVE BIDDING
            </CardTitle>
            <div className="flex items-center gap-3">
              <GavelAnimation size={40} />
              <Badge variant="outline" className="animate-pulse border-secondary text-secondary bg-secondary/10 shadow-lg shadow-secondary/20">BIDDING OPEN</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="space-y-6">
            {/* Player Info with Photo & Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Large Photo */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-transparent">
                  {currentPlayer.photo_url ? (
                    <img
                      src={currentPlayer.photo_url}
                      alt={currentPlayer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.photo-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`photo-fallback w-full h-full flex items-center justify-center ${currentPlayer.photo_url ? 'hidden' : ''}`}>
                    <User className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Center: Player Details */}
              <div className="space-y-4 flex flex-col justify-center">
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl font-bold font-display mb-3 text-white tracking-tight">{currentPlayer.name}</h2>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    <Badge className="text-sm px-3 py-1 bg-white/10 text-white border-white/10 hover:bg-white/20">{currentPlayer.category}</Badge>
                    {currentPlayer.role && (
                      <Badge variant="outline" className="text-sm px-3 py-1 border-white/20 text-white/70 bg-white/5">{currentPlayer.role}</Badge>
                    )}
                    <Badge variant={currentPlayer.is_overseas ? "secondary" : "outline"} className={`text-sm px-3 py-1 ${currentPlayer.is_overseas ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'border-white/20 text-white/50 bg-white/5'}`}>
                      {currentPlayer.country}
                    </Badge>
                  </div>
                  <p className="mt-4 text-white/60">
                    Base Price: <span className="font-bold text-white text-lg font-mono ml-1">{formatCurrency(currentPlayer.base_price)}</span>
                  </p>
                </div>
              </div>

              {/* Right: Stats */}
              <div>
                <PlayerStatsCard
                  playerId={currentPlayer.id}
                  playerName={currentPlayer.name}
                  country={currentPlayer.country}
                />
              </div>
            </div>

            {/* Current Bid */}
            <div className="bg-gradient-to-br from-accent/20 to-black/60 rounded-xl p-6 border border-accent/50 shadow-lg shadow-accent/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-accent" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-accent/80 mb-1 uppercase tracking-widest font-bold">CURRENT BID</p>
                  <p className="text-5xl font-bold text-white font-display drop-shadow-md">{formatBidAmount(liveRound.current_bid)}</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-full border border-accent/30">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
              </div>
            </div>

            {/* Leading Team */}
            {liveRound.current_bid_team_id && liveRound.teams ? (
              <div className="bg-gradient-to-br from-primary/20 to-black/60 rounded-xl p-4 border border-primary/50 shadow-lg animate-fade-in relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <Avatar className="w-16 h-16 border-2 border-primary/50 shadow-md">
                    {teams.find(t => t.id === liveRound.current_bid_team_id)?.logo_url ? (
                      <AvatarImage
                        src={teams.find(t => t.id === liveRound.current_bid_team_id)?.logo_url || ''}
                        alt={liveRound.teams.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">{liveRound.teams.short_code}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-xs text-primary/80 uppercase tracking-widest font-bold mb-1">🏆 LEADING FRANCHISE</p>
                    <p className="text-2xl font-bold text-white font-display leading-none">{liveRound.teams.name}</p>
                    <p className="text-sm text-white/50 font-medium mt-1">{liveRound.teams.short_code} • Highest Bidder</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 border-dashed">
                <p className="text-center text-white/40 flex items-center justify-center gap-2">
                  <GavelAnimation size={20} />
                  Awaiting first bid...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teams Purse Overview */}
      <Card className="border border-white/10 bg-black/40 backdrop-blur-md">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="flex items-center gap-2 font-display text-white">
            <Users className="w-5 h-5 text-accent" />
            Franchise Purse Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${liveRound.current_bid_team_id === team.id
                  ? 'border-primary bg-primary/20 shadow-lg shadow-primary/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10 border border-white/10">
                    {team.logo_url ? (
                      <AvatarImage src={team.logo_url} alt={team.short_code} />
                    ) : (
                      <AvatarFallback className="text-xs font-bold bg-white/10 text-white">{team.short_code}</AvatarFallback>
                    )}
                  </Avatar>
                  <p className="font-semibold font-display text-white">{team.short_code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency(team.purse_remaining)}</span>
                </div>
                {liveRound.current_bid_team_id === team.id && (
                  <Badge className="mt-2 bg-primary text-white border-none">🏆 Leading</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAuctionView;
