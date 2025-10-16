import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Sparkles, Settings, UserCircle, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Dashboard from "./Dashboard";
import Hub from "./Hub";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import QuickActionWidget from "@/components/QuickActionWidget";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuickAction, setShowQuickAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-background">W</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Wealthify</span>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="hub" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Hub
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <UserCircle className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="hub">
            <Hub />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPage />
          </TabsContent>

          <TabsContent value="profile">
            <Profile />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Action Button */}
      <Button
        onClick={() => setShowQuickAction(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-[var(--shadow-glow)] gradient-primary p-0 hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Quick Action Widget */}
      <QuickActionWidget 
        open={showQuickAction} 
        onOpenChange={setShowQuickAction}
      />
    </div>
  );
}
