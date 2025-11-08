import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, AlertCircle, Target } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

export default function DashboardInsights() {
  const { format } = useCurrency();
  
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
            <motion.div 
              key={idx} 
              className="relative bg-card rounded-lg p-5 border border-border transition-all hover:shadow-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.01, x: 4 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-lg" />
              <div className="flex items-start gap-4 pl-3">
                <div className="p-2 bg-destructive/10 rounded-lg flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Overspending Alert: {item.category}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You've spent {format(item.spent)} of your {format(item.limit)} budget 
                    — that's {format(item.overage)} over limit. Consider reducing expenses in this category.
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="relative bg-card rounded-lg p-5 border border-border transition-all hover:shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01, x: 4 }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-l-lg" />
            <div className="flex items-start gap-4 pl-3">
              <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-success mb-1">Great Budget Management!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You're staying within all your budgets this month. Keep up the excellent work!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Investment Updates */}
        {investments && investments.length > 0 && (
          <motion.div 
            className="relative bg-card rounded-lg p-5 border border-border transition-all hover:shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.01, x: 4 }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
            <div className="flex items-start gap-4 pl-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Investment Portfolio Update</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your portfolio has {investments.length} investment{investments.length > 1 ? 's' : ''} 
                  totaling {format(totalInvestments)}. Average value per investment: {format(avgInvestmentValue)}.
                  {totalInvestments < 10000 && " Consider increasing contributions to reach your long-term goals faster."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Spending Trends */}
        {transactions && transactions.length > 0 && (
          <motion.div 
            className="relative bg-card rounded-lg p-5 border border-border transition-all hover:shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileHover={{ scale: 1.01, x: 4 }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />
            <div className="flex items-start gap-4 pl-3">
              <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Monthly Activity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You've made {transactions.length} transaction{transactions.length > 1 ? 's' : ''} in the last 30 days. 
                  {transactions.length > 50 && " That's quite active! Consider reviewing recurring expenses to identify savings opportunities."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
