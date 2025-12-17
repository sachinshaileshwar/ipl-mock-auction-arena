import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBidAmount } from "@/lib/currencyUtils";
import { History, User, CheckCircle, XCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface AuctionPlayer {
  id: string;
  name: string;
  category: string;
  country: string;
  sold_price: number | null;
  photo_url: string | null;
  status: string;
  teams: {
    name: string;
    short_code: string;
    logo_url: string | null;
  } | null;
}

interface RecentlySoldCarouselProps {
  compact?: boolean;
}

export const RecentlySoldCarousel = ({ compact = false }: RecentlySoldCarouselProps) => {
  const [players, setPlayers] = useState<AuctionPlayer[]>([]);

  useEffect(() => {
    fetchAuctionedPlayers();
    const interval = setInterval(fetchAuctionedPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctionedPlayers = async () => {
    try {
      const { data } = await api.get("/api/auction/recently-sold");
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Error fetching recently sold players:", error);
    }
  };

  if (players.length === 0) {
    return null;
  }

  const CarouselContentBlock = (
    <Carousel
      opts={{
        align: "start",
        loop: players.length > 3,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {players.map((player) => {
          const isSold = player.status === "sold";

          return (
            <CarouselItem key={player.id} className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${compact
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : isSold
                  ? 'bg-gradient-to-br from-green-900/40 to-black/60 border-green-500/30 hover:border-green-500/50'
                  : 'bg-gradient-to-br from-red-900/40 to-black/60 border-red-500/30 hover:border-red-500/50'
                }`}>
                {/* Status Badge */}
                <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${compact ? (isSold ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white') :
                  (isSold ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20')
                  }`}>
                  {isSold ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {isSold ? 'SOLD' : 'UNSOLD'}
                </div>

                {/* Player Photo & Info */}
                <div className="flex items-start gap-3 mt-2">
                  <div className="flex-shrink-0">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 shadow-md ${compact ? 'border-white/20' :
                          (isSold ? 'border-green-500/50' : 'border-red-500/50')
                          }`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {!player.photo_url && (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-md ${compact ? 'bg-white/10 border-white/10' :
                        (isSold ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50')
                        }`}>
                        <User className="w-7 h-7 text-white/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-white">{player.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 border-white/20 text-white/70 bg-white/5">{player.category}</Badge>
                    </div>
                    <p className="text-xs text-white/50 mt-1">{player.country}</p>
                  </div>
                </div>

                {/* Team/Price Info */}
                <div className={`mt-3 pt-3 border-t ${compact ? 'border-white/10' : 'border-white/10'}`}>
                  {isSold && player.teams ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {player.teams.logo_url ? (
                          <img
                            src={player.teams.logo_url}
                            alt={player.teams.short_code}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10">
                            <span className="text-[10px] font-bold text-white">{player.teams.short_code?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-white/80">{player.teams.short_code}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-bold font-mono">
                        {formatBidAmount(player.sold_price || 0)}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-red-400 font-medium">No bids received</span>
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      {players.length > 3 && (
        <>
          <CarouselPrevious className="hidden md:flex -left-4 bg-black/60 border-white/10 text-white hover:bg-black/80 hover:text-white" />
          <CarouselNext className="hidden md:flex -right-4 bg-black/60 border-white/10 text-white hover:bg-black/80 hover:text-white" />
        </>
      )}
    </Carousel>
  );

  if (compact) {
    return CarouselContentBlock;
  }

  return (
    <Card className="bg-black/40 bg-gradient-to-b from-white/5 to-transparent border border-white/10 overflow-hidden backdrop-blur-md">
      <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-accent" />
          Recent Auction Results
          <Badge variant="outline" className="ml-2 border-white/20 text-white/60 bg-white/5">{players.length} players</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 pt-4">
        {CarouselContentBlock}
      </CardContent>
    </Card>
  );
};
