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
      
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm bg-card/95 animate-bounce-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto">
            <TrophyAnimation size={100} />
          </div>
          <CardTitle className="text-4xl md:text-5xl font-display font-bold text-gradient-cricket">
            IPL MOCK AUCTION
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Step into the dugout! Build your dream XI through live bidding wars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 transition-all hover:scale-105 hover:shadow-md">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Squad Builder</p>
              <p className="text-sm text-muted-foreground">Manage your XI & purse</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20 transition-all hover:scale-105 hover:shadow-md">
              <Gavel className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="font-semibold">Live Paddle</p>
              <p className="text-sm text-muted-foreground">Real-time bidding action</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20 transition-all hover:scale-105 hover:shadow-md">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground text-xs font-bold">🏏</span>
              </div>
              <p className="font-semibold">Match Ready</p>
              <p className="text-sm text-muted-foreground">Instant sync across devices</p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate("/login")} 
            size="lg" 
            className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6 font-display tracking-wide shadow-glow transition-all hover:scale-[1.02]"
          >
            ENTER THE AUCTION ARENA
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            🏟️ Join the bidding war • Build your championship squad
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
