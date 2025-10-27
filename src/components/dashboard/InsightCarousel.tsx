import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Insight {
  type: string;
  icon: any;
  color: string;
  title: string;
  message: string;
}

export default function InsightCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: transactions } = useQuery({
    queryKey: ['transactions-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]);
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: investments } = useQuery({
    queryKey: ['investments-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_type', 'investment')
        .eq('is_active', true);
      return data || [];
    },
    refetchInterval: 10000,
  });

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

  const allInsights: Insight[] = [];

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

  useEffect(() => {
    if (!isHovered && allInsights.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % allInsights.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isHovered, allInsights.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allInsights.length) % allInsights.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allInsights.length);
  };

  if (allInsights.length === 0) {
    return null;
  }

  const currentInsight = allInsights[currentIndex];
  const Icon = currentInsight.icon;

  return (
    <>
      <div
        className="insight-carousel-container group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowAllInsights(true)}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col items-center gap-3 px-12 py-6">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 flex-shrink-0 animate-pulse ${
              currentInsight.color === 'destructive' ? 'text-destructive' :
              currentInsight.color === 'success' ? 'text-success' :
              currentInsight.color === 'primary' ? 'text-primary' :
              'text-accent'
            }`} />
            <h3 className={`text-base font-semibold ${
              currentInsight.color === 'destructive' ? 'text-destructive' :
              currentInsight.color === 'success' ? 'text-success' :
              'text-foreground'
            }`}>
              {currentInsight.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-2xl">
            {currentInsight.message}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {allInsights.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={showAllInsights} onOpenChange={setShowAllInsights}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto popup-animation">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
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
