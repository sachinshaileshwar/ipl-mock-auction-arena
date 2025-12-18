import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatToLakhs } from "@/lib/currencyUtils";

interface Team {
  id: string;
  name: string;
  short_code: string;
  purse_start: number;
  purse_remaining: number;
  max_squad_size: number;
  max_overseas: number;
  logo_url: string | null;
}

const TeamsSetup = () => {

  const [newTeam, setNewTeam] = useState({
    name: "",
    short_code: "",
    username: "",
    password: "",
    purse_start: 90,
    max_squad_size: 25,
    max_overseas: 8,
  });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null); // For Edit
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null); // For Create
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editCredentials, setEditCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /* REMOVED: useEffect and fetchTeams
     Replaced with React Query for Caching/Instant Load */
  const { data: teams = [], isLoading: loadingTeams, refetch: refetchTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await api.get("/api/teams");
      return data.teams || [];
    },
    // Always fetch fresh data to ensure updates from other tabs are seen
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create team
      const { data: teamData } = await api.post("/api/teams", {
        name: newTeam.name,
        short_code: newTeam.short_code,
        purse_start: newTeam.purse_start,
        max_squad_size: newTeam.max_squad_size,
        max_overseas: newTeam.max_overseas,
      });

      // Create user account for team
      await api.post("/api/auth/create-team-user", {
        email: `${newTeam.username}@auction.local`,
        password: newTeam.password,
        username: newTeam.username,
        team_id: teamData.team.id,
      });

      toast({
        title: "Team Created",
        description: `${newTeam.name} has been created with username: ${newTeam.username}`,
      });

      setNewTeam({
        name: "",
        short_code: "",
        username: "",
        password: "",
        purse_start: 90,
        max_squad_size: 25,
        max_overseas: 8,
      });

      // Upload logo if selected
      if (createLogoFile) {
        await uploadLogo(teamData.team.id, createLogoFile);
        setCreateLogoFile(null);
      }

      // Refresh list
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      // Refresh list even on partial error (idempotency support)
      refetchTeams();
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await api.delete(`/api/teams/${teamId}`);

      toast({
        title: "Team Deleted",
        description: "Team has been removed",
      });

      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    }
  };

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadLogo = async (teamId: string, file: File) => {
    setUploadingLogo(true);
    try {
      const base64Image = await convertToBase64(file);

      await api.post(`/api/teams/${teamId}/logo`, {
        image: base64Image
      });

      toast({
        title: "Logo Uploaded",
        description: "Team logo has been updated",
      });

      setLogoFile(null);
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    setLoading(true);
    try {
      await api.put(`/api/teams/${editingTeam.id}`, {
        name: editingTeam.name,
        short_code: editingTeam.short_code,
        purse_start: editingTeam.purse_start,
        max_squad_size: editingTeam.max_squad_size,
        max_overseas: editingTeam.max_overseas,
      });

      // Upload logo if selected
      if (logoFile) {
        await uploadLogo(editingTeam.id, logoFile);
      }

      // Update credentials if provided
      if (editCredentials.username || editCredentials.password) {
        await api.post("/api/auth/create-team-user", {
          team_id: editingTeam.id,
          username: editCredentials.username,
          password: editCredentials.password,
          update_existing: true,
        });
      }

      toast({
        title: "Team Updated",
        description: `${editingTeam.name} has been updated`,
      });

      setEditDialogOpen(false);
      setEditingTeam(null);
      setEditCredentials({ username: "", password: "" });
      setLogoFile(null);
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Create New Team</CardTitle>
          <CardDescription className="text-white/60">Add teams and set up their login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload for Create */}
              <div className="col-span-full space-y-2">
                <Label className="text-white/80">Team Logo</Label>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Avatar className="w-20 h-20 ring-2 ring-white/10">
                    {createLogoFile ? (
                      <AvatarImage src={URL.createObjectURL(createLogoFile)} alt="Preview" />
                    ) : (
                      <AvatarFallback className="text-2xl bg-accent text-white font-bold">{newTeam.short_code || "NEW"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCreateLogoFile(e.target.files[0]);
                        }
                      }}
                      className="cursor-pointer bg-black/20 border-white/10 text-white file:bg-white/10 file:text-white file:border-0 hover:file:bg-white/20"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Team Name</Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Mumbai Indians"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_code" className="text-white/80">Short Code</Label>
                <Input
                  id="short_code"
                  value={newTeam.short_code}
                  onChange={(e) => setNewTeam({ ...newTeam, short_code: e.target.value.toUpperCase() })}
                  placeholder="MI"
                  maxLength={5}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">Username</Label>
                <Input
                  id="username"
                  value={newTeam.username}
                  onChange={(e) => setNewTeam({ ...newTeam, username: e.target.value })}
                  placeholder="team_mi"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purse" className="text-white/80">Starting Purse (Cr)</Label>
                <Input
                  id="purse"
                  type="number"
                  value={newTeam.purse_start}
                  onChange={(e) => setNewTeam({ ...newTeam, purse_start: Number(e.target.value) })}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="squad_size" className="text-white/80">Max Squad Size</Label>
                <Input
                  id="squad_size"
                  type="number"
                  value={newTeam.max_squad_size}
                  onChange={(e) => setNewTeam({ ...newTeam, max_squad_size: Number(e.target.value) })}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseas" className="text-white/80">Max Overseas</Label>
                <Input
                  id="overseas"
                  type="number"
                  value={newTeam.max_overseas}
                  onChange={(e) => setNewTeam({ ...newTeam, max_overseas: Number(e.target.value) })}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/80 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Existing Teams ({teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-center text-white/50 py-8">No teams created yet</p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-white/20">
                      {team.logo_url ? (
                        <AvatarImage src={team.logo_url} alt={team.name} />
                      ) : (
                        <AvatarFallback className="bg-accent text-white font-bold">{team.short_code}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-sm text-white/60">
                        {team.short_code} • Purse: {formatToLakhs(team.purse_start)} • Squad: {team.max_squad_size} • Overseas: {team.max_overseas}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/20 hover:text-accent"
                      onClick={async () => {
                        try {
                          // Fetch username from backend
                          const { data } = await api.get(`/api/teams/${team.id}/user`);

                          setEditingTeam(team);
                          setEditCredentials({
                            username: data.username || "",
                            password: ""
                          });
                          setEditDialogOpen(true);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to load team details",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Team</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <form onSubmit={handleEditTeam} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-white/80">Team Logo</Label>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Avatar className="w-20 h-20 ring-2 ring-white/10">
                    {logoFile ? (
                      <AvatarImage src={URL.createObjectURL(logoFile)} alt="Preview" />
                    ) : editingTeam.logo_url ? (
                      <AvatarImage src={editingTeam.logo_url} alt={editingTeam.name} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-accent text-white font-bold">{editingTeam.short_code}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setLogoFile(e.target.files[0]);
                        }
                      }}
                      className="cursor-pointer bg-black/20 border-white/10 text-white file:bg-white/10 file:text-white file:border-0 hover:file:bg-white/20"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white/80">Team Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-short_code" className="text-white/80">Short Code</Label>
                  <Input
                    id="edit-short_code"
                    value={editingTeam.short_code}
                    onChange={(e) => setEditingTeam({ ...editingTeam, short_code: e.target.value.toUpperCase() })}
                    maxLength={5}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purse" className="text-white/80">Starting Purse (Cr)</Label>
                  <Input
                    id="edit-purse"
                    type="number"
                    value={editingTeam.purse_start}
                    onChange={(e) => setEditingTeam({ ...editingTeam, purse_start: Number(e.target.value) })}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-squad_size" className="text-white/80">Max Squad Size</Label>
                  <Input
                    id="edit-squad_size"
                    type="number"
                    value={editingTeam.max_squad_size}
                    onChange={(e) => setEditingTeam({ ...editingTeam, max_squad_size: Number(e.target.value) })}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-overseas" className="text-white/80">Max Overseas</Label>
                  <Input
                    id="edit-overseas"
                    type="number"
                    value={editingTeam.max_overseas}
                    onChange={(e) => setEditingTeam({ ...editingTeam, max_overseas: Number(e.target.value) })}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-accent"
                  />
                </div>
              </div>

              {/* Credentials Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="font-semibold mb-4 text-white">Update Team Credentials (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username" className="text-white/80">Username</Label>
                    <Input
                      id="edit-username"
                      value={editCredentials.username}
                      onChange={(e) => setEditCredentials({ ...editCredentials, username: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password" className="text-white/80">New Password</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editCredentials.password}
                      onChange={(e) => setEditCredentials({ ...editCredentials, password: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent"
                    />
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Only fill these fields if you want to update the team's login credentials
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingTeam(null);
                    setEditCredentials({ username: "", password: "" });
                    setLogoFile(null);
                  }}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || uploadingLogo} className="bg-accent hover:bg-accent/80 text-white font-bold">
                  {loading || uploadingLogo ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsSetup;