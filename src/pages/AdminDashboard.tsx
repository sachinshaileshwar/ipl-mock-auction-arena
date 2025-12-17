import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Users, UserPlus, Upload, Gavel, Trophy, BarChart3, LayoutGrid } from "lucide-react";
import TeamsSetup from "@/components/admin/TeamsSetup";
import PlayersManagement from "@/components/admin/PlayersManagement";
import LiveAuction from "@/components/admin/LiveAuction";
import RetentionSetup from "@/components/admin/RetentionSetup";
import TeamsOverview from "@/components/admin/TeamsOverview";
import AuctionStatistics from "@/components/admin/AuctionStatistics";
import CricketLoader from "@/components/CricketLoader";
import { TrophyAnimation, GavelAnimation, StadiumAnimation } from "@/components/CricketAnimations";

const AdminDashboard = () => {
  const { profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b14] bg-gradient-stadium cricket-pattern">
        <CricketLoader size={120} message="Setting up the auction arena..." />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c4e] via-[#050b14] to-black text-foreground">

      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <TrophyAnimation size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display tracking-wide">IPL Mock Auction</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Auctioneer's Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open("/auction", "_blank")}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-accent transition-all duration-200"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Projector View
            </Button>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 relative">
        {/* Background Decorations */}
        <div className="fixed top-20 left-10 opacity-5 pointer-events-none">
          <StadiumAnimation size={300} />
        </div>

        <Tabs defaultValue="auction" className="space-y-6 relative z-10">

          {/* Glass Tabs List */}
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md h-auto flex-wrap justify-center gap-1">
              <TabsTrigger
                value="auction"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 text-white/60 hover:text-white"
              >
                <Gavel className="w-4 h-4 mr-2" />
                Live Auction
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-white/60 hover:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-white/60 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger
                value="retention"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-white/60 hover:text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Retention
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-white/60 hover:text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-white/60 hover:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area - Consistently styled container for all tabs */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[600px]">
            <TabsContent value="teams" className="animate-fade-in mt-0">
              <div className="prose-invert">
                <TeamsSetup />
              </div>
            </TabsContent>

            <TabsContent value="players" className="animate-fade-in mt-0">
              <div className="prose-invert">
                <PlayersManagement />
              </div>
            </TabsContent>

            <TabsContent value="retention" className="animate-fade-in mt-0">
              <div className="prose-invert">
                <RetentionSetup />
              </div>
            </TabsContent>

            <TabsContent value="auction" className="animate-fade-in mt-0">
              <LiveAuction />
            </TabsContent>

            <TabsContent value="overview" className="animate-fade-in mt-0">
              <div className="prose-invert">
                <TeamsOverview />
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="animate-fade-in mt-0">
              <div className="prose-invert">
                <AuctionStatistics />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-white/5 bg-black/20 text-center">
        <p className="text-sm text-white/30">
          IPL Mock Auction • Official Auctioneer Dashboard
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
