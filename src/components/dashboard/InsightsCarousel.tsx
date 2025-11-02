import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Insight {
  id: string;
  title: string;
  description: string;
  sentiment: string;
  insight_type: string;
  action_items: string[];
  generated_at?: string;
}

export default function InsightsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ml-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ml_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Insight[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('ml-insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ml_insights',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ml-insights'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('generate-insights', {
        body: { user_id: user.id }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-insights'] });
      toast.success("AI insights generated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to generate insights");
      console.error(error);
    }
  });

  // Auto-refresh daily if last insight is older than 24h (attempt once per mount)
  const attemptedAuto = useRef(false);
  useEffect(() => {
    if (attemptedAuto.current) return;
    if (!insights) return;
    if (generateMutation.isPending) return;
    const last = insights[0];
    const lastTime = last?.generated_at ? new Date(last.generated_at).getTime() : 0;
    const dayMs = 24 * 60 * 60 * 1000;
    if (insights.length === 0 || Date.now() - lastTime > dayMs) {
      attemptedAuto.current = true;
      generateMutation.mutate();
    }
  }, [insights, generateMutation]);

  const handlePrevious = () => {
    if (!insights || insights.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? insights.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!insights || insights.length === 0) return;
    setCurrentIndex((prev) => (prev === insights.length - 1 ? 0 : prev + 1));
  };

  const getColorClasses = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'border-l-4 border-l-success bg-success/5';
      case 'negative':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      case 'warning':
      case 'neutral':
        return 'border-l-4 border-l-warning bg-warning/5';
      default:
        return 'border-l-4 border-l-primary bg-primary/5';
    }
  };

  const getIconColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      case 'warning':
      case 'neutral':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Insights
          </h2>
        </div>
        <div className="text-muted-foreground text-center py-8">Loading insights...</div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    // Auto-generate on first load if none (single attempt)
    if (!generateMutation.isPending && !attemptedAuto.current) {
      attemptedAuto.current = true;
      generateMutation.mutate();
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Insights
          </h2>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            {generateMutation.isPending ? 'Generating…' : 'Generate'}
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Preparing your insights…</p>
        </Card>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Smart Insights
        </h2>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        {/* Carousel Card */}
        <Card 
          className={`p-6 transition-all duration-300 animate-fade-in ${getColorClasses(currentInsight.sentiment)}`}
        >
          <div className="flex items-start gap-4">
            <Sparkles className={`w-6 h-6 mt-1 ${getIconColor(currentInsight.sentiment)}`} />
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold">{currentInsight.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentInsight.description}
              </p>
              {currentInsight.action_items && currentInsight.action_items.length > 0 && (
                <div className="pt-2 space-y-1">
                  {currentInsight.action_items.map((item, idx) => (
                    <div key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Navigation Arrows */}
        {insights.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {insights.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to insight ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
