import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Prediction {
  category: string;
  message: string;
  risk_level: 'low' | 'medium' | 'high';
  current_spent?: number;
  budget_limit?: number;
  predicted_total?: number;
  action_items?: string[];
}

interface SpendingAnalysis {
  predictions?: Prediction[];
  overall_insight?: string;
  total_predicted_overspend?: number;
}

export default function SpendingInsightsCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const attemptedAuto = useRef(false);

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['spending-analysis-carousel'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('analyze-spending', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      return data as SpendingAnalysis;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      await refetch();
    },
    onSuccess: () => {
      toast.success("Spending analysis updated!");
    },
    onError: () => {
      toast.error("Failed to analyze spending");
    }
  });

  // Auto-generate on first load
  useEffect(() => {
    if (attemptedAuto.current) return;
    if (!analysis && !isLoading) {
      attemptedAuto.current = true;
      generateMutation.mutate();
    }
  }, [analysis, isLoading]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const getColorClasses = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-destructive/10 border-destructive/40 text-destructive';
      case 'medium':
        return 'bg-warning/10 border-warning/40 text-warning';
      case 'low':
      default:
        return 'bg-success/10 border-success/40 text-success';
    }
  };

  const getBgGradient = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'from-destructive/20 to-destructive/5';
      case 'medium':
        return 'from-warning/20 to-warning/5';
      case 'low':
      default:
        return 'from-success/20 to-success/5';
    }
  };

  const getIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Lightbulb className="w-4 h-4" />;
      case 'low':
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const capsules: { type: 'prediction' | 'insight' | 'overspend'; data: any; riskLevel: string }[] = [];

  // Add overall insight as first capsule
  if (analysis?.overall_insight) {
    capsules.push({
      type: 'insight',
      data: analysis.overall_insight,
      riskLevel: 'low'
    });
  }

  // Add predictions
  if (analysis?.predictions) {
    analysis.predictions.forEach(pred => {
      capsules.push({
        type: 'prediction',
        data: pred,
        riskLevel: pred.risk_level
      });
    });
  }

  // Add overspend warning
  if (analysis?.total_predicted_overspend && analysis.total_predicted_overspend > 0) {
    capsules.push({
      type: 'overspend',
      data: analysis.total_predicted_overspend,
      riskLevel: 'high'
    });
  }

  if (isLoading || generateMutation.isPending) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI Spending Analysis
          </h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 h-24 rounded-full bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (capsules.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI Spending Analysis
          </h3>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
        </div>
        <div className="flex items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-border bg-muted/20">
          <p className="text-muted-foreground text-sm">Add transactions and budgets to get AI-powered spending insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Spending Analysis
        </h3>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Arrow */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {capsules.map((capsule, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={`flex-shrink-0 min-w-[280px] max-w-[320px] px-5 py-4 rounded-full border-2 bg-gradient-to-r ${getBgGradient(capsule.riskLevel)} ${getColorClasses(capsule.riskLevel)} transition-all hover:scale-[1.02] hover:shadow-lg cursor-default`}
            >
              {capsule.type === 'insight' && (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground line-clamp-2 leading-snug">{capsule.data}</p>
                </div>
              )}

              {capsule.type === 'prediction' && (
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 p-1.5 rounded-full ${capsule.riskLevel === 'high' ? 'bg-destructive/20' : capsule.riskLevel === 'medium' ? 'bg-warning/20' : 'bg-success/20'}`}>
                    {getIcon(capsule.riskLevel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{capsule.data.category}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{capsule.data.message}</p>
                  </div>
                  {capsule.data.current_spent !== undefined && capsule.data.budget_limit !== undefined && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-semibold">
                        ${capsule.data.current_spent?.toFixed(0)}/${capsule.data.budget_limit?.toFixed(0)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {capsule.type === 'overspend' && (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-1.5 rounded-full bg-destructive/20">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Predicted Overspend: <span className="font-bold">${capsule.data.toFixed(2)}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
