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
        <Card className="p-4 border-primary/50 bg-primary/5">
          <p className="text-sm">{predictions.overall_insight}</p>
        </Card>
      )}

      <div className="grid gap-3">
        {predictions.predictions?.map((pred: any, idx: number) => (
          <Card key={idx} className={`p-4 border ${getRiskColor(pred.risk_level)}`}>
            <div className="flex items-start gap-3">
              {getRiskIcon(pred.risk_level)}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{pred.category}</h4>
                    <p className="text-sm text-muted-foreground">{pred.message}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">
                      ${pred.current_spent?.toFixed(2)} / ${pred.budget_limit?.toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      pred.predicted_total > pred.budget_limit 
                        ? 'text-destructive' 
                        : 'text-success'
                    }`}>
                      Projected: ${pred.predicted_total?.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {pred.action_items && pred.action_items.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Action Items:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {pred.action_items.map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {predictions.total_predicted_overspend > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <p className="text-sm font-semibold text-destructive">
            ⚠️ Total Predicted Overspend: ${predictions.total_predicted_overspend.toFixed(2)}
          </p>
        </Card>
      )}
    </div>
  );
}
