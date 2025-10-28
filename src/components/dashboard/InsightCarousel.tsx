import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Target, ChevronLeft, ChevronRight, AlertCircle, DollarSign, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const { data: mlInsights, refetch: refetchInsights, isLoading } = useQuery({
    queryKey: ['ml-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('ml_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return data || [];
    },
  });

  const generateInsights = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in to generate insights", variant: "destructive" });
        return;
      }

      toast({ title: "Generating AI insights...", description: "Analyzing your financial data" });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      await refetchInsights();
      toast({ title: "Insights generated!", description: "Fresh insights based on your latest data" });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Failed to generate insights",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return AlertCircle;
      case 'spending_pattern':
        return TrendingDown;
      case 'savings_opportunity':
        return DollarSign;
      case 'anomaly':
        return TrendingDown;
      case 'prediction':
        return Target;
      default:
        return Sparkles;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'destructive';
      case 'spending_pattern':
        return 'primary';
      case 'savings_opportunity':
        return 'success';
      case 'anomaly':
        return 'destructive';
      case 'prediction':
        return 'accent';
      default:
        return 'primary';
    }
  };

  const allInsights: Insight[] = mlInsights?.map((insight: any) => ({
    type: insight.insight_type,
    icon: getIconForType(insight.insight_type),
    color: getColorForType(insight.insight_type),
    title: insight.title,
    message: insight.description
  })) || [];

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
    return (
      <div className="insight-carousel-container group">
        <div className="flex flex-col items-center gap-3 px-12 py-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse text-primary" />
            <h3 className="text-base font-semibold">Generate AI Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-2xl">
            Get personalized financial insights based on your spending patterns, budgets, and goals.
          </p>
          <Button onClick={generateInsights} disabled={isLoading} className="mt-2">
            {isLoading ? 'Loading...' : 'Generate Insights'}
          </Button>
        </div>
      </div>
    );
  }

  const currentInsight = allInsights[currentIndex];
  const Icon = currentInsight.icon;

  return (
    <>
      <div className="flex items-center gap-3">
        <div
          className="insight-carousel-container group flex-1"
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

        <Button
          onClick={generateInsights}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Dialog open={showAllInsights} onOpenChange={setShowAllInsights}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto popup-animation">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Smart Insights
              </DialogTitle>
              <Button onClick={generateInsights} disabled={isLoading} size="sm" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Refresh'}
              </Button>
            </div>
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
