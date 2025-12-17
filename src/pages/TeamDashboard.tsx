import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Trophy, Users, IndianRupee, Globe, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import LiveAuctionView from "@/components/LiveAuctionView";
import { formatToLakhs } from "@/lib/currencyUtils";
import { PlayerStatsCard } from "@/components/PlayerStatsCard";
import { RecentlySoldCarousel } from "@/components/RecentlySoldCarousel";
import CricketLoader from "@/components/CricketLoader";
import { TrophyAnimation, BatSwingAnimation, StadiumAnimation } from "@/components/CricketAnimations";

interface AvailablePlayer {
  id: string;
  name: string;
  category: string;
  country: string;
  is_overseas: boolean;
  base_price: number;
  set_no: number | null;
}

interface Team {
  id: string;
  name: string;
  short_code: string;
  logo_url: string | null;
  purse_remaining: number;
  max_squad_size: number;
  max_overseas: number;
}

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

const TeamDashboard = () => {
  const { profile, signOut, loading } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (profile?.team_id) {
      fetchTeamData();
      const interval = setInterval(fetchTeamData, 5000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const fetchTeamData = async () => {
    if (!profile?.team_id) return;

    try {
      const [teamRes, availableRes] = await Promise.all([
        api.get(`/api/teams/${profile.team_id}`),
        api.get("/api/players?status=not_started")
      ]);

      const teamData = teamRes.data.team;
      if (teamData) {
        // Remove team_players from team object to avoid clutter if needed, 
        // but keeping it is fine.
        setTeam(teamData);

        if (teamData.team_players) {
          const formattedPlayers = teamData.team_players.map((tp: any) => ({
            id: tp.players.id,
            name: tp.players.name,
            category: tp.players.category,
            country: tp.players.country,
            is_overseas: tp.players.is_overseas,
            price: tp.price,
            is_retained: tp.is_retained,
            photo_url: tp.players.photo_url,
          }));
          setPlayers(formattedPlayers);
        }
      }

      if (availableRes.data.players) {
        setAvailablePlayers(availableRes.data.players);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-stadium cricket-pattern">
        <CricketLoader size={120} message="Loading your squad..." />
      </div>
    );
  }

  if (!profile || (profile.role !== "participant" && profile.role !== "team")) {
    return <Navigate to="/login" replace />;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  const retainedPlayers = players.filter(p => p.is_retained);
  const boughtPlayers = players.filter(p => !p.is_retained);
  const totalSpent = players.reduce((sum, p) => sum + Number(p.price), 0);
  const overseasCount = players.filter(p => p.is_overseas).length;

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/50 to-purple-900/20 pointer-events-none" />

      <header className="relative bg-black/40 border-b border-white/10 shadow-lg backdrop-blur-md z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {team.logo_url ? (
              <Avatar className="w-14 h-14 border-2 border-white/10 shadow-md transition-transform duration-200 hover:scale-110">
                <AvatarImage src={team.logo_url} alt={team.name} />
              </Avatar>
            ) : (
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center shadow-md border border-white/10 transition-transform duration-200 hover:scale-110">
                <Trophy className="w-6 h-6 text-white/80" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white font-display tracking-tight">{team.name}</h1>
              <p className="text-sm text-accent font-medium tracking-wider uppercase">{team.short_code} • Franchise Dashboard</p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-red-400 transition-all duration-200 hover:border-red-500/50">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Decorative Cricket Elements */}
      <div className="relative z-0 pointer-events-none">
        <div className="absolute top-4 left-4 opacity-10 hidden lg:block">
          <BatSwingAnimation size={80} />
        </div>
        <div className="absolute top-4 right-4 opacity-10 hidden lg:block">
          <StadiumAnimation size={100} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/10 bg-black/40 backdrop-blur-sm group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/60 group-hover:text-accent transition-colors">
                <IndianRupee className="w-5 h-5" />
                Purse Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white font-display">{formatToLakhs(team.purse_remaining)}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/10 bg-black/40 backdrop-blur-sm group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/60 group-hover:text-blue-400 transition-colors">
                <Users className="w-5 h-5" />
                Squad Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white font-display">{players.length}<span className="text-xl text-white/30">/{team.max_squad_size}</span></p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/10 bg-black/40 backdrop-blur-sm group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/60 group-hover:text-amber-400 transition-colors">
                <Globe className="w-5 h-5" />
                Overseas Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white font-display">{overseasCount}<span className="text-xl text-white/30">/{team.max_overseas}</span></p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/10 bg-black/40 backdrop-blur-sm group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/60 group-hover:text-emerald-400 transition-colors">
                <IndianRupee className="w-5 h-5" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-400 font-display">{formatToLakhs(totalSpent)}</p>
            </CardContent>
          </Card>
        </div>



        {/* Squad Details */}
        <Tabs defaultValue="auction" className="space-y-6">
          <TabsList className="w-full md:w-auto bg-black/40 border border-white/10 p-1 rounded-xl backdrop-blur-md">
            <TabsTrigger value="auction" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-white text-white/60 hover:text-white transition-all">🔴 Live Auction</TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 hover:text-white transition-all">All Players ({players.length})</TabsTrigger>
            <TabsTrigger value="retained" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 hover:text-white transition-all">Retained ({retainedPlayers.length})</TabsTrigger>
            <TabsTrigger value="bought" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 hover:text-white transition-all">Auction Buys ({boughtPlayers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="auction">
            <LiveAuctionView />

            {/* Available Players by Set */}
            {availablePlayers.length > 0 && (
              <Card className="shadow-lg mt-8 border border-white/10 bg-black/40 backdrop-blur-md">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="flex items-center gap-2 font-display text-white">
                    <Users className="w-5 h-5 text-accent" />
                    Players Up for Grabs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {Array.from(new Set(availablePlayers.map(p => p.set_no))).sort((a, b) => (a || 0) - (b || 0)).map(setNo => {
                      const setPlayers = availablePlayers.filter(p => p.set_no === setNo);
                      return (
                        <div key={setNo} className="space-y-3">
                          <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">Set {setNo} • {setPlayers.length} cricketers</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {setPlayers.slice(0, 12).map(player => (
                              <div key={player.id} className="p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer group">
                                <p className="font-medium text-sm text-white truncate group-hover:text-accent">{player.name}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  <Badge variant="outline" className="text-[10px] px-1.5 border-white/20 text-white/50">{player.category}</Badge>
                                </div>
                                <p className="text-xs text-emerald-400 font-mono mt-2">{formatToLakhs(player.base_price)}</p>
                              </div>
                            ))}
                            {setPlayers.length > 12 && (
                              <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">
                                <span className="text-xs text-white/50 group-hover:text-white">+{setPlayers.length - 12} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <RecentlySoldCarousel />
            {players.length === 0 ? (
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="py-12 text-center">
                  <TrophyAnimation size={100} className="mx-auto mb-4 opacity-50" />
                  <p className="text-white/60">No cricketers in your squad yet. Time to bid!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {players.map((player) => (
                  <Card key={player.id} className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-5">
                        {/* Player Photo */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-gradient-to-br from-white/5 to-transparent relative group-hover:border-accent/50 transition-colors">
                            {player.photo_url ? (
                              <img
                                src={player.photo_url}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.photo-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`photo-fallback w-full h-full flex items-center justify-center ${player.photo_url ? 'hidden' : ''}`}>
                              <User className="w-10 h-10 text-white/20" />
                            </div>
                          </div>
                        </div>
                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-xl font-display text-white group-hover:text-accent transition-colors">{player.name}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5">{player.category}</Badge>
                                <Badge variant={player.is_overseas ? "secondary" : "outline"} className={player.is_overseas ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "border-white/10 text-white/50 bg-white/5"}>{player.country}</Badge>
                                {player.is_retained && <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30">Retained</Badge>}
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">{formatToLakhs(player.price)}</p>
                          </div>
                        </div>
                      </div>
                      <PlayerStatsCard
                        playerId={player.id}
                        playerName={player.name}
                        country={player.country}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="retained">
            {retainedPlayers.length === 0 ? (
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="py-12 text-center">
                  <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4 animate-pulse" />
                  <p className="text-white/60">No retained players</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {retainedPlayers.map((player) => (
                  <Card key={player.id} className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/10 bg-black/40 backdrop-blur-md group">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {player.photo_url && (
                          <img
                            src={player.photo_url}
                            alt={player.name}
                            className="w-20 h-20 object-cover rounded-lg border border-white/10 shadow-sm transition-transform duration-200 hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-bold text-lg font-display text-white group-hover:text-accent transition-colors">{player.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5">{player.category}</Badge>
                            <Badge variant={player.is_overseas ? "secondary" : "outline"} className={player.is_overseas ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "border-white/10 text-white/50 bg-white/5"}>{player.country}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">{formatToLakhs(player.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bought">
            {boughtPlayers.length === 0 ? (
              <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="py-12 text-center">
                  <BatSwingAnimation size={100} className="mx-auto mb-4 opacity-50" />
                  <p className="text-white/60">No auction purchases yet. Get bidding!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boughtPlayers.map((player) => (
                  <Card key={player.id} className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/10 bg-black/40 backdrop-blur-md group">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {player.photo_url && (
                          <img
                            src={player.photo_url}
                            alt={player.name}
                            className="w-20 h-20 object-cover rounded-lg border border-white/10 shadow-sm transition-transform duration-200 hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-bold text-lg font-display text-white group-hover:text-accent transition-colors">{player.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5">{player.category}</Badge>
                            <Badge variant={player.is_overseas ? "secondary" : "outline"} className={player.is_overseas ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "border-white/10 text-white/50 bg-white/5"}>{player.country}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">{formatToLakhs(player.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <p className="text-center text-sm text-white/40">
          🏏 {team.name} • Franchise Dashboard • IPL Mock Auction 2025
        </p>
      </footer>
    </div>
  );
};

export default TeamDashboard;
