import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Lightbulb, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsightCardProps {
  insight: any;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('ml_insights')
        .delete()
        .eq('id', insight.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-insights'] });
      toast({
        title: "Insight dismissed",
      });
    },
  });

  const getIcon = () => {
    switch (insight.insight_type) {
      case 'spending_pattern': return <TrendingUp className="w-5 h-5" />;
      case 'budget_alert': return <AlertTriangle className="w-5 h-5" />;
      case 'savings_opportunity': return <Lightbulb className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (insight.insight_type) {
      case 'spending_pattern': return 'bg-accent/10 text-accent';
      case 'budget_alert': return 'bg-error/10 text-error';
      case 'savings_opportunity': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <CardTitle className="text-base">{insight.title}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate()}
          className="h-8 w-8 -mt-1 -mr-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{insight.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getTypeColor()}>
            {insight.insight_type.replace('_', ' ')}
          </Badge>
          {insight.confidence_score && (
            <Badge variant="outline" className="text-xs">
              {(parseFloat(insight.confidence_score) * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </div>

        {insight.action_items && insight.action_items.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-muted-foreground">Action Items:</p>
            <ul className="space-y-1">
              {insight.action_items.map((action: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}