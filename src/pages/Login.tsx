import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrophyAnimation } from "@/components/CricketAnimations";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Get signIn from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(username, password);

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome Back!",
        description: "Login successful",
      });

      // Navigation is handled by Index.tsx or we can do it here if we want to be explicit
      // But since we just updated the context (signIn sets user), 
      // navigating to "/" should trigger the Index.tsx redirection logic immediately without reload.
      navigate("/");

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description:
          error?.response?.data?.error ||
          error?.error ||
          (error.message === 'Network Error' ? "Cannot connect to server. Ensure backend is running." : "Invalid username or password"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black/80 to-purple-900/40 pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl bg-black/40 backdrop-blur-xl border border-white/10 relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto bg-white/5 p-4 rounded-full border border-white/10 shadow-lg mb-2">
            <TrophyAnimation size={60} />
          </div>
          <div>
            <CardTitle className="text-3xl font-display font-bold text-white tracking-wider">
              IPL MOCK AUCTION
            </CardTitle>
            <CardDescription className="text-white/60">Enter the Auction Arena</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-accent/50 focus:ring-accent/20"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-accent/50 focus:ring-accent/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/80 shadow-lg shadow-accent/20 mt-2" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{" "}
            <a href="/signup" className="text-accent hover:text-accent/80 hover:underline font-medium transition-colors">
              Create Admin Account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
