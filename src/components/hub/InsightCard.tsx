import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, DollarSign, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InsightCardProps {
  insight: {
    id: string;
    insight_type: string;
    title: string;
    description: string;
    confidence_score: number;
    sentiment: string;
    action_items?: string[];
  };
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          bg: 'bg-success/10 border-success/30 hover:bg-success/20',
          text: 'text-success',
          icon: 'text-success',
          badge: 'bg-success/20 text-success border-success/30'
        };
      case 'negative':
        return {
          bg: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20',
          text: 'text-destructive',
          icon: 'text-destructive',
          badge: 'bg-destructive/20 text-destructive border-destructive/30'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
          text: 'text-yellow-500',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
        };
      default:
        return {
          bg: 'bg-primary/10 border-primary/30 hover:bg-primary/20',
          text: 'text-primary',
          icon: 'text-primary',
          badge: 'bg-primary/20 text-primary border-primary/30'
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern': return TrendingDown;
      case 'savings_opportunity': return DollarSign;
      case 'budget_alert': return AlertTriangle;
      case 'goal_warning': return Target;
      case 'encouragement': return Sparkles;
      case 'recommendation': return Lightbulb;
      case 'prediction': return TrendingUp;
      default: return Brain;
    }
  };

  const styles = getSentimentStyles(insight.sentiment || 'neutral');
  const Icon = getIcon(insight.insight_type);

  return (
    <div className={`${styles.bg} border-2 rounded-xl p-5 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in cursor-pointer group relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent opacity-5" />
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${styles.bg} border ${styles.badge} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <Badge variant="outline" className={`${styles.badge} text-xs animate-pulse`}>
              {Math.round(insight.confidence_score * 100)}% confident
            </Badge>
          </div>
        </div>
        <h3 className={`font-bold text-lg mb-2 ${styles.text}`}>{insight.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
        {insight.action_items && insight.action_items.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Action Items:</p>
            <ul className="space-y-1">
              {insight.action_items.map((action, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className={styles.text}>•</span>
                  <span className="text-foreground/80">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}