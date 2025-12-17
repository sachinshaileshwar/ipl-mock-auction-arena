import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

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

const AdminSignup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/api/auth/signup", {
                username,
                email,
                password,
                role: "admin",
            });

            console.log("SIGNUP RESPONSE:", response.data);

            toast({
                title: "Account Created",
                description: "Admin account created successfully",
            });

            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Signup Failed",
                description:
                    description:
                    (typeof error?.response?.data?.error === 'string' ? error.response.data.error : JSON.stringify(error?.response?.data?.error || {})) ||
                (typeof error?.error === 'string' ? error.error : "") ||
                error?.message ||
                "Failed to create admin account",
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
                        Create Admin Account
                    </CardTitle>
                    <CardDescription className="text-white/60">Setup your Auction Master profile</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white/80">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-accent/50 focus:ring-accent/20"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-accent/50 focus:ring-accent/20"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/80">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-accent/50 focus:ring-accent/20"
                            placeholder="Create a strong password"
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/80 shadow-lg shadow-accent/20 mt-4" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Admin"}
                    </Button>

                    <div className="text-center text-sm text-white/40 mt-4">
                        Already have an account?{" "}
                        <a href="/login" className="text-accent hover:text-accent/80 hover:underline font-medium transition-colors">
                            Login here
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
);
};

export default AdminSignup;
