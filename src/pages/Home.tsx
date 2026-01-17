import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Settings, LogOut, TrendingUp, Layers, User as UserIcon, Sparkles } from "lucide-react";
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
import FloatingIcons from "@/components/ui/FloatingIcons";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuickAction, setShowQuickAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, insight: "Your financial overview with key metrics and insights" },
    { value: "hub", label: "Hub", icon: Layers, insight: "Manage accounts, transactions, goals, and budgets" },
    { value: "investments", label: "Investments", icon: TrendingUp, insight: "Track your investment portfolio and performance" },
    { value: "settings", label: "Settings", icon: Settings, insight: "Customize your preferences and account settings" },
    { value: "profile", label: "Profile", icon: UserIcon, insight: "View and edit your profile information" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global Floating Icons Background */}
      <FloatingIcons variant="subtle" className="opacity-20" />
      
      {/* Gradient Orbs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <span className="text-xl font-bold text-primary-foreground">W</span>
            </motion.div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Wealthify
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 bg-background/50 hover:bg-background/80"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 p-1.5 glass border border-white/5">
              {tabs.map((tab, index) => (
                <InsightTooltip key={tab.value} insight={tab.insight} type="tip" showForNewUsers>
                  <TabsTrigger 
                    value={tab.value} 
                    className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <tab.icon className="w-4 h-4" />
                    </motion.div>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                </InsightTooltip>
              ))}
            </TabsList>
          </motion.div>

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
