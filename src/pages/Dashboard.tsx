import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ExpenseChart from "../components/ExpenseChart";
import StatDetailDialog from "../components/dashboard/StatDetailDialog";
import InsightTooltip from "../components/InsightTooltip";
import InsightCarousel from "../components/dashboard/InsightCarousel";
import { TrendingUp, Wallet, PiggyBank, CreditCard, Target, DollarSign, Sparkles, TrendingDown, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const [showAllBudgets, setShowAllBudgets] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    type: 'balance' | 'spend' | 'savings' | 'investments' | null;
  }>({ open: false, type: null });

  const { data: accounts } = useQuery({
    queryKey: ['dashboard-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: transactions } = useQuery({
    queryKey: ['dashboard-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      return data || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-spending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data } = await supabase
        .from('transactions')
        .select('transaction_date, amount, category')
        .eq('user_id', user.id)
        .gte('transaction_date', sixMonthsAgo.toISOString())
        .lt('amount', 0);
      
      if (!data) return [];
      
      const monthlyMap: Record<string, number> = {};
      data.forEach(tx => {
        const month = tx.transaction_date.substring(0, 7);
        monthlyMap[month] = (monthlyMap[month] || 0) + Math.abs(parseFloat(tx.amount.toString()));
      });
      
      return Object.entries(monthlyMap)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));
    }
  });

  const { data: goals } = useQuery({
    queryKey: ['dashboard-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['dashboard-budgets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .limit(3);
      return data || [];
    },
  });

  const { data: budgetSpending } = useQuery({
    queryKey: ['dashboard-budget-spending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      
      const thisMonth = new Date().toISOString().substring(0, 7);
      const { data } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user.id)
        .gte('transaction_date', `${thisMonth}-01`)
        .lt('amount', 0);

      if (!data) return {};
      
      const spending: Record<string, number> = {};
      data.forEach(tx => {
        spending[tx.category] = (spending[tx.category] || 0) + Math.abs(parseFloat(tx.amount.toString()));
      });
      return spending;
    },
  });

  // Calculate stats
  const totalBalance = accounts?.reduce((sum, acc) => 
    sum + parseFloat(acc.balance.toString()), 0) || 0;
  
  const savingsAccounts = accounts?.filter(acc => acc.account_type === 'savings') || [];
  const totalSavings = savingsAccounts.reduce((sum, acc) => 
    sum + parseFloat(acc.balance.toString()), 0) || 0;
  
  const investmentAccounts = accounts?.filter(acc => acc.account_type === 'investment') || [];
  const totalInvestments = investmentAccounts.reduce((sum, acc) => 
    sum + parseFloat(acc.balance.toString()), 0) || 0;

  const thisMonth = new Date().toISOString().substring(0, 7);
  const monthlySpend = transactions
    ?.filter(tx => tx.transaction_date.startsWith(thisMonth) && parseFloat(tx.amount.toString()) < 0)
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount.toString())), 0) || 0;

  const spendByCategory: Record<string, number> = {};
  transactions
    ?.filter(tx => tx.transaction_date.startsWith(thisMonth) && parseFloat(tx.amount.toString()) < 0)
    .forEach(tx => {
      spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + 
        Math.abs(parseFloat(tx.amount.toString()));
    });

  const recentTransactions = transactions?.slice(0, 4) || [];

  const categoryColors = [
    'hsl(164 100% 39%)', 'hsl(210 100% 50%)', 'hsl(280 100% 50%)', 
    'hsl(45 100% 50%)', 'hsl(0 100% 50%)', 'hsl(120 100% 35%)'
  ];

  const getDetailData = () => {
    switch (detailDialog.type) {
      case 'balance':
        return {
          title: 'Balance Breakdown',
          data: accounts?.map((acc, idx) => ({
            label: acc.account_name,
            value: parseFloat(acc.balance.toString()),
            color: categoryColors[idx % categoryColors.length]
          })) || [],
          total: totalBalance
        };
      case 'spend':
        return {
          title: 'Monthly Spending by Category',
          data: Object.entries(spendByCategory).map(([label, value], idx) => ({
            label,
            value,
            color: categoryColors[idx % categoryColors.length]
          })),
          total: monthlySpend
        };
      case 'savings':
        return {
          title: 'Savings Accounts',
          data: savingsAccounts.map((acc, idx) => ({
            label: acc.account_name,
            value: parseFloat(acc.balance.toString()),
            color: categoryColors[idx % categoryColors.length]
          })),
          total: totalSavings
        };
      case 'investments':
        return {
          title: 'Investment Portfolio',
          data: investmentAccounts.map((acc, idx) => ({
            label: acc.account_name,
            value: parseFloat(acc.balance.toString()),
            color: categoryColors[idx % categoryColors.length]
          })),
          total: totalInvestments
        };
      default:
        return { title: '', data: [], total: 0 };
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
  });

  const userName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 page-transition relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gradient">Hey {userName}!</h1>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your financial dashboard at a glance
          </p>
        </div>

        {/* Smart Insights Section */}
        <InsightCarousel />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightTooltip 
            insight="Click to see a detailed breakdown of all your linked accounts and their balances"
            type="tip"
            showForNewUsers
          >
            <div 
              className="stat-card group relative overflow-hidden"
              onClick={() => setDetailDialog({ open: true, type: 'balance' })}
            >
            <div className="absolute top-0 right-0 opacity-5">
              <Wallet className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Balance</span>
                <Wallet className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {accounts?.length || 0} accounts
              </div>
            </div>
            </div>
          </InsightTooltip>

          <InsightTooltip 
            insight={monthlySpend > 2000 ? "Your spending is higher than average. Consider setting budgets to track expenses." : "Track your monthly spending by category. Click for details."}
            type={monthlySpend > 2000 ? "warning" : "tip"}
            showForNewUsers
          >
            <div 
              className="stat-card group relative overflow-hidden"
              onClick={() => setDetailDialog({ open: true, type: 'spend' })}
            >
            <div className="absolute top-0 right-0 opacity-5">
              <CreditCard className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Monthly Spend</span>
                <CreditCard className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold">${monthlySpend.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {Object.keys(spendByCategory).length} categories
              </div>
            </div>
            </div>
          </InsightTooltip>

          <InsightTooltip 
            insight={totalSavings > 0 ? "Great job building your savings! Keep contributing regularly." : "Start building your emergency fund by linking a savings account."}
            type={totalSavings > 0 ? "success" : "info"}
            showForNewUsers
          >
            <div 
              className="stat-card group relative overflow-hidden"
              onClick={() => setDetailDialog({ open: true, type: 'savings' })}
            >
            <div className="absolute top-0 right-0 opacity-5">
              <PiggyBank className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Savings</span>
                <PiggyBank className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold">${totalSavings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {savingsAccounts.length} accounts
              </div>
            </div>
            </div>
          </InsightTooltip>

          <InsightTooltip 
            insight={totalInvestments > 0 ? "Your investments are growing! Monitor performance in the Investments tab." : "Start investing for your future. Check the Investments tab for AI-powered suggestions."}
            type={totalInvestments > 0 ? "success" : "info"}
            showForNewUsers
          >
            <div 
              className="stat-card group relative overflow-hidden"
              onClick={() => setDetailDialog({ open: true, type: 'investments' })}
            >
            <div className="absolute top-0 right-0 opacity-5">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Investments</span>
                <TrendingUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold">${totalInvestments.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {investmentAccounts.length} accounts
              </div>
            </div>
            </div>
          </InsightTooltip>
        </div>

        {/* Goals & Budgets Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Section */}
          <InsightTooltip
            insight="Set financial goals to stay motivated. Track progress and achieve your dreams!"
            type="tip"
            showForNewUsers
          >
            <div className="card-surface cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAllGoals(true)}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Active Goals
                </h3>
              </div>
            <div className="space-y-4">
              {goals && goals.length > 0 ? (
                <>
                  {goals.map((goal) => {
                    const progress = (parseFloat(goal.current_amount.toString()) / parseFloat(goal.target_amount.toString())) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{goal.goal_name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${parseFloat(goal.current_amount.toString()).toFixed(2)} of ${parseFloat(goal.target_amount.toString()).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-primary">{progress.toFixed(0)}%</div>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Click to view all goals
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No active goals</p>
              )}
            </div>
            </div>
          </InsightTooltip>

          {/* Budgets Section */}
          <InsightTooltip
            insight="Set monthly budgets to control spending and avoid overspending in any category"
            type="tip"
            showForNewUsers
          >
            <div className="card-surface cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAllBudgets(true)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget Overview
              </h3>
            </div>
            <div className="space-y-4">
              {budgets && budgets.length > 0 ? (
                <>
                  {budgets.map((budget) => {
                    const spent = budgetSpending?.[budget.category] || 0;
                    const limit = parseFloat(budget.limit_amount.toString());
                    const progress = (spent / limit) * 100;
                    const isOverBudget = spent > limit;
                    
                    return (
                      <div 
                        key={budget.id} 
                        className={`p-4 rounded-lg transition-all ${
                          isOverBudget 
                            ? 'bg-destructive/10 border-2 border-destructive shadow-lg scale-105' 
                            : 'bg-surface hover:bg-surface/80'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{budget.category}</div>
                            <div className="text-xs text-muted-foreground">
                              ${spent.toFixed(2)} of ${limit.toFixed(2)}
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                            {progress.toFixed(0)}%
                          </div>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        {isOverBudget && (
                          <div className="text-xs text-destructive mt-2 font-medium">
                            ⚠️ Over budget by ${(spent - limit).toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Click to view all budgets
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No budgets set</p>
              )}
            </div>
            </div>
          </InsightTooltip>
        </div>

        {/* All Goals Dialog */}
        <Dialog open={showAllGoals} onOpenChange={setShowAllGoals}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Financial Goals</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {goals?.map((goal) => {
                const progress = (parseFloat(goal.current_amount.toString()) / parseFloat(goal.target_amount.toString())) * 100;
                return (
                  <div key={goal.id} className="p-4 bg-surface rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{goal.goal_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{goal.goal_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${parseFloat(goal.current_amount.toString()).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">of ${parseFloat(goal.target_amount.toString()).toFixed(2)}</p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-right text-muted-foreground mt-1">{progress.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* All Budgets Dialog */}
        <Dialog open={showAllBudgets} onOpenChange={setShowAllBudgets}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Budgets</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {budgets?.map((budget) => {
                const spent = budgetSpending?.[budget.category] || 0;
                const limit = parseFloat(budget.limit_amount.toString());
                const percentage = (spent / limit) * 100;
                const isOverBudget = percentage > 100;

                return (
                  <div key={budget.id} className="p-4 bg-surface rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{budget.category}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                          ${spent.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">of ${limit.toFixed(2)}</p>
                      </div>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-3" />
                    <p className={`text-xs text-right mt-1 ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {percentage.toFixed(1)}% {isOverBudget && '(Over Budget!)'}
                    </p>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <InsightTooltip
            insight={monthlyData && monthlyData.length > 1 && monthlyData[monthlyData.length - 1].amount > monthlyData[monthlyData.length - 2].amount 
              ? "Your spending increased this month. Review your categories to identify where you can save." 
              : "Visualize your spending patterns over time to make informed financial decisions"}
            type={monthlyData && monthlyData.length > 1 && monthlyData[monthlyData.length - 1].amount > monthlyData[monthlyData.length - 2].amount ? "warning" : "info"}
            showForNewUsers
          >
            <div className="card-surface">
              <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
              <ExpenseChart data={monthlyData} />
            </div>
          </InsightTooltip>
        </div>

        {/* Recent Transactions */}
        <div className="card-surface">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <div className="font-medium">{tx.merchant_name || tx.description || 'Transaction'}</div>
                    <div className="text-xs text-muted-foreground">
                      {tx.category} • {new Date(tx.transaction_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-semibold ${parseFloat(tx.amount.toString()) > 0 ? 'text-success' : 'text-foreground'}`}>
                    {parseFloat(tx.amount.toString()) > 0 ? '+' : ''}
                    ${Math.abs(parseFloat(tx.amount.toString())).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        <StatDetailDialog 
          {...getDetailData()}
          open={detailDialog.open}
          onOpenChange={(open) => setDetailDialog({ open, type: null })}
        />
    </div>
  );
}
