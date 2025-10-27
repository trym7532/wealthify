import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, AlertCircle, Target, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DashboardInsights() {
  const [showAllInsights, setShowAllInsights] = useState(false);

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

  // Prepare all insights
  const allInsights = [];

  if (overspendingCategories && overspendingCategories.length > 0) {
    overspendingCategories.forEach((item) => {
      allInsights.push({
        type: 'alert',
        icon: TrendingDown,
        color: 'destructive',
        title: `Overspending Alert: ${item.category}`,
        message: `You've spent $${item.spent.toFixed(2)} of your $${item.limit.toFixed(2)} budget — that's $${item.overage.toFixed(2)} over limit.`
      });
    });
  } else {
    allInsights.push({
      type: 'success',
      icon: TrendingUp,
      color: 'success',
      title: 'Great Budget Management!',
      message: "You're staying within all your budgets this month. Keep up the excellent work!"
    });
  }

  if (investments && investments.length > 0) {
    allInsights.push({
      type: 'info',
      icon: Target,
      color: 'primary',
      title: 'Investment Portfolio Update',
      message: `Your portfolio has ${investments.length} investment${investments.length > 1 ? 's' : ''} totaling $${totalInvestments.toFixed(2)}. Average value per investment: $${avgInvestmentValue.toFixed(2)}.${totalInvestments < 10000 ? " Consider increasing contributions to reach your long-term goals faster." : ""}`
    });
  }

  if (transactions && transactions.length > 0) {
    allInsights.push({
      type: 'activity',
      icon: TrendingUp,
      color: 'accent',
      title: 'Monthly Activity',
      message: `You've made ${transactions.length} transaction${transactions.length > 1 ? 's' : ''} in the last 30 days.${transactions.length > 50 ? " That's quite active! Consider reviewing recurring expenses to identify savings opportunities." : ""}`
    });
  }

  // Combine all insights into scrolling text
  const scrollingText = allInsights.map(i => i.title).join(' • ');

  return (
    <>
      <div 
        className="insight-capsule relative overflow-hidden"
        onClick={() => setShowAllInsights(true)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 animate-pulse" />
          <div className="overflow-hidden flex-1">
            <div className="flex gap-8 animate-scroll-left whitespace-nowrap">
              <span className="text-sm font-medium">{scrollingText}</span>
              <span className="text-sm font-medium">{scrollingText}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">Click for details →</span>
        </div>
      </div>

      <Dialog open={showAllInsights} onOpenChange={setShowAllInsights}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto popup-animation">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Smart Insights
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {allInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`card-surface border-l-4 ${
                  insight.color === 'destructive' ? 'border-l-destructive' :
                  insight.color === 'success' ? 'border-l-success' :
                  insight.color === 'primary' ? 'border-l-primary' :
                  'border-l-accent'
                } animate-fade-in-up`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 ${
                    insight.color === 'destructive' ? 'text-destructive' :
                    insight.color === 'success' ? 'text-success' :
                    insight.color === 'primary' ? 'text-primary' :
                    'text-accent'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      insight.color === 'destructive' ? 'text-destructive' :
                      insight.color === 'success' ? 'text-success' :
                      ''
                    }`}>{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
