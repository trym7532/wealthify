import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Receipt, Target, Brain, Wallet, Trophy } from "lucide-react";
import AccountsSection from "@/components/hub/AccountsSection";
import TransactionsSection from "@/components/hub/TransactionsSection";
import GoalsSection from "@/components/hub/GoalsSection";
import InsightsSection from "@/components/hub/InsightsSection";
import BudgetsSection from "@/components/hub/BudgetsSection";
import AchievementsSection from "@/components/hub/AchievementsSection";
import InsightTooltip from "@/components/InsightTooltip";
import FloatingIcons from "@/components/ui/FloatingIcons";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { useCurrency } from "@/lib/currency";

export default function Hub() {
  const [activeTab, setActiveTab] = useState("accounts");
  const { format, currency } = useCurrency();

  // Fetch summary stats
  const { data: accounts } = useQuery({
    queryKey: ['hub-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      return data || [];
    }
  });

  const { data: goals } = useQuery({
    queryKey: ['hub-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    }
  });

  const { data: budgets } = useQuery({
    queryKey: ['hub-budgets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    }
  });

  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance?.toString() || '0'), 0) || 0;
  const activeGoals = goals?.length || 0;
  const activeBudgets = budgets?.length || 0;

  const tabs = [
    { value: "accounts", label: "Accounts", icon: Landmark, insight: "View and manage all your connected bank accounts" },
    { value: "transactions", label: "Transactions", icon: Receipt, insight: "Track all your income and expenses in one place" },
    { value: "goals", label: "Goals", icon: Target, insight: "Set and track your financial goals like savings or debt payoff" },
    { value: "budgets", label: "Budgets", icon: Wallet, insight: "Create budgets for different spending categories" },
    { value: "achievements", label: "Achievements", icon: Trophy, insight: "Unlock badges and track milestones for your financial journey" },
    { value: "insights", label: "Insights", icon: Brain, insight: "Get AI-powered insights to improve your financial health" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      {/* Floating Icons Background */}
      <FloatingIcons variant="minimal" className="opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Financial Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage accounts, track transactions, and get AI-powered insights
            </p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <div className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={totalBalance} prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '$'} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Landmark className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <div className="text-2xl font-bold text-accent">
                  <AnimatedCounter value={activeGoals} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"
              >
                <Target className="w-5 h-5 text-accent" />
              </motion.div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Budgets</p>
                <div className="text-2xl font-bold text-cyan-400">
                  <AnimatedCounter value={activeBudgets} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center"
              >
                <Wallet className="w-5 h-5 text-cyan-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full glass p-1 border border-white/5">
              {tabs.map((tab, index) => (
                <InsightTooltip key={tab.value} insight={tab.insight} type="tip" showForNewUsers>
                  <TabsTrigger 
                    value={tab.value} 
                    className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
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

            <TabsContent value="accounts" className="space-y-4">
              <AccountsSection />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <TransactionsSection />
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <GoalsSection />
            </TabsContent>

            <TabsContent value="budgets" className="space-y-4">
              <BudgetsSection />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <AchievementsSection />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <InsightsSection />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
