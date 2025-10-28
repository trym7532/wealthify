import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Brain, TrendingUp, AlertTriangle, Lightbulb, Trophy, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const INSIGHT_ICONS = {
  achievement: Trophy,
  warning: AlertTriangle,
  alert: AlertTriangle,
  suggestion: Lightbulb,
  info: Info
};

const INSIGHT_COLORS = {
  achievement: 'from-success/20 to-success/5 border-success/30',
  warning: 'from-destructive/20 to-destructive/5 border-destructive/30',
  alert: 'from-destructive/25 to-destructive/10 border-destructive/40',
  suggestion: 'from-warning/20 to-warning/5 border-warning/30',
  info: 'from-primary/20 to-primary/5 border-primary/30'
};

const INSIGHT_TEXT_COLORS = {
  achievement: 'text-success',
  warning: 'text-destructive',
  alert: 'text-destructive',
  suggestion: 'text-warning',
  info: 'text-primary'
};

export default function InsightCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: insights = [], refetch } = useQuery({
    queryKey: ['dashboard-insights-carousel'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [transactionsRes, budgetsRes, investmentsRes, mlInsightsRes] = await Promise.all([
        supabase.from('transactions').select('*').gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]),
        supabase.from('budgets').select('*'),
        supabase.from('linked_accounts').select('*').eq('account_type', 'investment').eq('is_active', true),
        supabase.from('ml_insights').select('*').order('generated_at', { ascending: false })
      ]);

      const insights = [];
      const transactions = transactionsRes.data || [];
      const budgets = budgetsRes.data || [];
      const investments = investmentsRes.data || [];
      const mlInsights = mlInsightsRes.data || [];

      // Add ML-generated insights first
      mlInsights.forEach(insight => {
        insights.push({
          type: insight.insight_type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence_score
        });
      });

      // Add real-time calculated insights
      const categorySpending: Record<string, number> = {};
      transactions.forEach(t => {
        if (t.transaction_type === 'debit') {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + parseFloat(t.amount.toString());
        }
      });

      // Budget status
      budgets.forEach(budget => {
        const spent = categorySpending[budget.category] || 0;
        const limit = parseFloat(budget.limit_amount.toString());
        const percentage = (spent / limit) * 100;

        if (percentage >= 100) {
          insights.push({
            type: 'alert',
            title: `🚨 ${budget.category} Budget Exceeded`,
            description: `Over by ₹${(spent - limit).toFixed(2)} • ${percentage.toFixed(0)}% of limit`
          });
        } else if (percentage >= 80) {
          insights.push({
            type: 'warning',
            title: `⚠️ ${budget.category} Budget Alert`,
            description: `${percentage.toFixed(0)}% used • ₹${(limit - spent).toFixed(2)} remaining`
          });
        }
      });

      // Investment insights
      if (investments.length > 0) {
        const totalValue = investments.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0);
        insights.push({
          type: 'achievement',
          title: '💼 Portfolio Update',
          description: `${investments.length} investments • ₹${totalValue.toFixed(2)} total value`
        });
      }

      return insights.length > 0 ? insights : [
        {
          type: 'info',
          title: '👋 Welcome to Wealthify',
          description: 'Add transactions to get personalized AI insights'
        }
      ];
    },
    refetchInterval: 10000
  });

  useEffect(() => {
    if (!isHovered && insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [insights.length, isHovered]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  if (insights.length === 0) return null;

  const currentInsight = insights[currentIndex];
  const Icon = INSIGHT_ICONS[currentInsight.type as keyof typeof INSIGHT_ICONS] || Brain;
  const colorClass = INSIGHT_COLORS[currentInsight.type as keyof typeof INSIGHT_COLORS] || INSIGHT_COLORS.info;
  const textColorClass = INSIGHT_TEXT_COLORS[currentInsight.type as keyof typeof INSIGHT_TEXT_COLORS] || INSIGHT_TEXT_COLORS.info;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${colorClass} backdrop-blur-sm cursor-pointer group transition-all duration-500 hover:shadow-lg hover:scale-[1.02]`}
        onClick={() => setShowAllInsights(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-background/50 ${textColorClass} animate-pulse-subtle`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg mb-1 ${textColorClass} animate-fade-in-up`}>
                {currentInsight.title}
              </h3>
              <p className="text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {currentInsight.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {insights.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-current opacity-100' : 'w-1.5 bg-current opacity-30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Click for all insights →</span>
          </div>
        </div>

        {insights.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <Dialog open={showAllInsights} onOpenChange={setShowAllInsights}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              All AI Insights
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {insights.map((insight, idx) => {
              const Icon = INSIGHT_ICONS[insight.type as keyof typeof INSIGHT_ICONS] || Brain;
              const colorClass = INSIGHT_COLORS[insight.type as keyof typeof INSIGHT_COLORS] || INSIGHT_COLORS.info;
              const textColorClass = INSIGHT_TEXT_COLORS[insight.type as keyof typeof INSIGHT_TEXT_COLORS] || INSIGHT_TEXT_COLORS.info;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border bg-gradient-to-r ${colorClass} animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${textColorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${textColorClass}`}>
                        {insight.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
