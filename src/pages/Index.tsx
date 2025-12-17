import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gavel } from "lucide-react";
import CricketLoader from "@/components/CricketLoader";
import { TrophyAnimation, BatSwingAnimation, StumpsAnimation } from "@/components/CricketAnimations";

const Index = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/team", { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-stadium cricket-pattern">
        <CricketLoader size={150} message="Setting up the pitch..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-stadium cricket-pattern p-4 relative overflow-hidden">
      {/* Decorative cricket elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <BatSwingAnimation size={120} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <StumpsAnimation size={100} />
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border border-white/10 backdrop-blur-xl bg-black/30 animate-bounce-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto">
            <TrophyAnimation size={100} />
          </div>
          <CardTitle className="text-4xl md:text-5xl font-display font-bold text-gradient-cricket drop-shadow-lg">
            IPL MOCK AUCTION
          </CardTitle>
          <CardDescription className="text-lg text-white/70">
            Step into the dugout! Build your dream XI through live bidding wars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/40 rounded-lg border border-primary/20 transition-all hover:scale-105 hover:shadow-lg hover:bg-primary/10 group">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Squad Builder</p>
              <p className="text-sm text-white/60">Manage your XI & purse</p>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg border border-secondary/20 transition-all hover:scale-105 hover:shadow-lg hover:bg-secondary/10 group">
              <Gavel className="w-8 h-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Live Paddle</p>
              <p className="text-sm text-white/60">Real-time bidding action</p>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg border border-accent/20 transition-all hover:scale-105 hover:shadow-lg hover:bg-accent/10 group">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-secondary-foreground text-xs font-bold">🏏</span>
              </div>
              <p className="font-semibold text-white">Match Ready</p>
              <p className="text-sm text-white/60">Instant sync across devices</p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6 font-display tracking-wide shadow-glow transition-all hover:scale-[1.02] border border-white/10"
          >
            ENTER THE AUCTION ARENA
          </Button>

          <p className="text-center text-sm text-white/40 flex items-center justify-center gap-2">
            <span>🏟️</span> Join the bidding war • Build your championship squad
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
