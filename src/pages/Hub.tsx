import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Receipt, Target, Brain, Wallet } from "lucide-react";
import AccountsSection from "@/components/hub/AccountsSection";
import TransactionsSection from "@/components/hub/TransactionsSection";
import GoalsSection from "@/components/hub/GoalsSection";
import InsightsSection from "@/components/hub/InsightsSection";
import BudgetsSection from "@/components/hub/BudgetsSection";

export default function Hub() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hub</h1>
            <p className="text-muted-foreground mt-1">
              Manage accounts, track transactions, and get AI-powered insights
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              <span className="hidden sm:inline">Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
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

          <TabsContent value="insights" className="space-y-4">
            <InsightsSection />
          </TabsContent>
        </Tabs>
    </div>
  );
}