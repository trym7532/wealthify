import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, AlertCircle, Target } from "lucide-react";

export default function DashboardInsights() {
  const { data: transactions } = useQuery({
    queryKey: ['transactions-insights'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]);
      return data || [];
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets-insights'],
    queryFn: async () => {
      const { data } = await supabase.from('budgets').select('*');
      return data || [];
    },
  });

  const { data: investments } = useQuery({
    queryKey: ['investments-insights'],
    queryFn: async () => {
      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('account_type', 'investment')
        .eq('is_active', true);
      return data || [];
    },
  });

  // Calculate overspending by category
  const categorySpending = transactions?.reduce((acc: Record<string, number>, t) => {
    if (t.transaction_type === 'debit') {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount.toString());
    }
    return acc;
  }, {});

  const overspendingCategories = budgets?.filter(budget => {
    const spent = categorySpending?.[budget.category] || 0;
    return spent > parseFloat(budget.limit_amount.toString());
  }).map(budget => ({
    category: budget.category,
    spent: categorySpending?.[budget.category] || 0,
    limit: parseFloat(budget.limit_amount.toString()),
    overage: (categorySpending?.[budget.category] || 0) - parseFloat(budget.limit_amount.toString())
  }));

  const totalInvestments = investments?.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0) || 0;
  const avgInvestmentValue = investments?.length ? totalInvestments / investments.length : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Smart Insights
      </h2>
      
      <div className="grid gap-3">
        {/* Overspending Alerts */}
        {overspendingCategories && overspendingCategories.length > 0 ? (
          overspendingCategories.map((item, idx) => (
            <div key={idx} className="card-surface border-l-4 border-l-destructive">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Overspending Alert: {item.category}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've spent ${item.spent.toFixed(2)} of your ${item.limit.toFixed(2)} budget 
                    — that's ${item.overage.toFixed(2)} over limit. Consider reducing expenses in this category.
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card-surface border-l-4 border-l-success">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-success">Great Budget Management!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You're staying within all your budgets this month. Keep up the excellent work!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Investment Updates */}
        {investments && investments.length > 0 && (
          <div className="card-surface border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Investment Portfolio Update</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your portfolio has {investments.length} investment{investments.length > 1 ? 's' : ''} 
                  totaling ${totalInvestments.toFixed(2)}. Average value per investment: ${avgInvestmentValue.toFixed(2)}.
                  {totalInvestments < 10000 && " Consider increasing contributions to reach your long-term goals faster."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Spending Trends */}
        {transactions && transactions.length > 0 && (
          <div className="card-surface border-l-4 border-l-accent">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold">Monthly Activity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You've made {transactions.length} transaction{transactions.length > 1 ? 's' : ''} in the last 30 days. 
                  {transactions.length > 50 && " That's quite active! Consider reviewing recurring expenses to identify savings opportunities."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
