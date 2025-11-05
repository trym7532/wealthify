import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SpendingPredictions() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: predictions, refetch } = useQuery({
    queryKey: ['spending-predictions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('analyze-spending', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: false, // Only fetch when explicitly called
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await refetch();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-warning" />;
      default:
        return <CheckCircle className="w-5 h-5 text-success" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-destructive/50 bg-destructive/5';
      case 'medium':
        return 'border-warning/50 bg-warning/5';
      default:
        return 'border-success/50 bg-success/5';
    }
  };

  if (!predictions) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">AI Spending Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Get AI-powered predictions about your spending patterns and budget risks
          </p>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze My Spending'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Budget Predictions</h3>
        <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {predictions.overall_insight && (
        <div className="relative bg-card rounded-lg p-5 border border-border">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
          <p className="text-sm pl-3 leading-relaxed">{predictions.overall_insight}</p>
        </div>
      )}

      <div className="grid gap-3">
        {predictions.predictions?.map((pred: any, idx: number) => {
          const getBorderColor = (level: string) => {
            switch (level) {
              case 'high': return 'bg-destructive';
              case 'medium': return 'bg-warning';
              default: return 'bg-success';
            }
          };
          
          return (
            <div key={idx} className="relative bg-card rounded-lg p-5 border border-border transition-all hover:shadow-md">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor(pred.risk_level)} rounded-l-lg`} />
              <div className="flex items-start gap-4 pl-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  pred.risk_level === 'high' ? 'bg-destructive/10' :
                  pred.risk_level === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  {getRiskIcon(pred.risk_level)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{pred.category}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pred.message}</p>
                    </div>
                    <div className="text-right text-sm flex-shrink-0">
                      <p className="font-semibold whitespace-nowrap">
                        ${pred.current_spent?.toFixed(2)} / ${pred.budget_limit?.toFixed(2)}
                      </p>
                      <p className={`text-xs whitespace-nowrap ${
                        pred.predicted_total > pred.budget_limit 
                          ? 'text-destructive' 
                          : 'text-success'
                      }`}>
                        Projected: ${pred.predicted_total?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {pred.action_items && pred.action_items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {pred.action_items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {predictions.total_predicted_overspend > 0 && (
        <div className="relative bg-card rounded-lg p-5 border border-border">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-lg" />
          <div className="flex items-center gap-3 pl-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm font-semibold text-destructive">
              Total Predicted Overspend: ${predictions.total_predicted_overspend.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
