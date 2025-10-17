import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ExpenseChart from "../components/ExpenseChart";
import StatDetailDialog from "../components/dashboard/StatDetailDialog";
import { TrendingUp, Wallet, PiggyBank, CreditCard } from "lucide-react";

export default function Dashboard() {
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
    }
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
    }
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

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your spending, budgets, and financial insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="card-surface cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setDetailDialog({ open: true, type: 'balance' })}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Total Balance</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {accounts?.length || 0} accounts
            </div>
          </div>

          <div 
            className="card-surface cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setDetailDialog({ open: true, type: 'spend' })}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Monthly Spend</span>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">${monthlySpend.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Object.keys(spendByCategory).length} categories
            </div>
          </div>

          <div 
            className="card-surface cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setDetailDialog({ open: true, type: 'savings' })}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Savings</span>
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">${totalSavings.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {savingsAccounts.length} accounts
            </div>
          </div>

          <div 
            className="card-surface cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setDetailDialog({ open: true, type: 'investments' })}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Investments</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">${totalInvestments.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {investmentAccounts.length} accounts
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <div className="card-surface">
            <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
            <ExpenseChart data={monthlyData} />
          </div>
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
