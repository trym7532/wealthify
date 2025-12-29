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
import { motion } from "framer-motion";

export default function Hub() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hub</h1>
            <p className="text-muted-foreground mt-1">
              Manage accounts, track transactions, and get AI-powered insights
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <InsightTooltip insight="View and manage all your connected bank accounts" type="tip" showForNewUsers>
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                <span className="hidden sm:inline">Accounts</span>
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Track all your income and expenses in one place" type="tip" showForNewUsers>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Set and track your financial goals like savings or debt payoff" type="tip" showForNewUsers>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Create budgets for different spending categories" type="tip" showForNewUsers>
              <TabsTrigger value="budgets" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Budgets</span>
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Unlock badges and track milestones for your financial journey" type="tip" showForNewUsers>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
            </InsightTooltip>
            <InsightTooltip insight="Get AI-powered insights to improve your financial health" type="tip" showForNewUsers>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </InsightTooltip>
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
  );
}