import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InsightCard from "./InsightCard";

export default function InsightsSection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ml-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ml_insights')
        .select('*')
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ml-insights'] });
      toast({
        title: "Insights generated",
        description: `Generated ${data.insights?.length || 0} new insights`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI Insights & Recommendations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ML-powered analysis of your spending patterns
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading insights...</div>
      ) : insights && insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No insights generated yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Add some transactions and click "Generate Insights" to get AI-powered recommendations
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            Generate Your First Insights
          </Button>
        </div>
      )}
    </div>
  );
}