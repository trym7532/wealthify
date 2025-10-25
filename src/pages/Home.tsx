import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Sparkles, Settings, UserCircle, LogOut, TrendingUp, Layers, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Dashboard from "./Dashboard";
import Hub from "./Hub";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import Investments from "./Investments";
import QuickActionWidget from "@/components/QuickActionWidget";
import FloatingActionButton from "@/components/FloatingActionButton";
import InsightTooltip from "@/components/InsightTooltip";

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
    <div className="min-h-screen bg-background finance-pattern-bg">
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
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 p-1">
            <InsightTooltip insight="Your financial overview with key metrics and insights" type="tip" showForNewUsers>
              <TabsTrigger value="dashboard" className="gap-2 tab-hover">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Manage accounts, transactions, goals, and budgets" type="tip" showForNewUsers>
              <TabsTrigger value="hub" className="gap-2 tab-hover">
                <Layers className="w-4 h-4" />
                Hub
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Track your investment portfolio and performance" type="tip" showForNewUsers>
              <TabsTrigger value="investments" className="gap-2 tab-hover">
                <TrendingUp className="w-4 h-4" />
                Investments
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Customize your preferences and account settings" type="tip" showForNewUsers>
              <TabsTrigger value="settings" className="gap-2 tab-hover">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="View and edit your profile information" type="tip" showForNewUsers>
              <TabsTrigger value="profile" className="gap-2 tab-hover">
                <UserIcon className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </InsightTooltip>
          </TabsList>

          <TabsContent value="dashboard" className="page-transition">
            <Dashboard />
          </TabsContent>

          <TabsContent value="hub" className="page-transition">
            <Hub />
          </TabsContent>

          <TabsContent value="investments" className="page-transition">
            <Investments />
          </TabsContent>

          <TabsContent value="settings" className="page-transition">
            <SettingsPage />
          </TabsContent>

          <TabsContent value="profile" className="page-transition">
            <Profile />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Action Button */}
      <FloatingActionButton onClick={() => setShowQuickAction(true)} />

      {/* Quick Action Widget */}
      <QuickActionWidget 
        open={showQuickAction} 
        onOpenChange={setShowQuickAction}
      />
    </div>
  );
}
