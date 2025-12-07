import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";

interface StockSuggestionCardProps {
  suggestion: {
    id: string;
    symbol: string;
    name: string;
    action: string;
    reason: string;
    confidence: number;
    target_price: number;
    current_price: number;
    sentiment: string;
  };
}

export default function StockSuggestionCard({ suggestion }: StockSuggestionCardProps) {
  const { format } = useCurrency();
  const getActionStyles = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return {
          bg: 'bg-success/10 border-success/30 hover:bg-success/20',
          text: 'text-success',
          icon: 'text-success',
          badge: 'bg-success/20 text-success border-success/30',
          btnVariant: 'default' as const
        };
      case 'sell':
        return {
          bg: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20',
          text: 'text-destructive',
          icon: 'text-destructive',
          badge: 'bg-destructive/20 text-destructive border-destructive/30',
          btnVariant: 'destructive' as const
        };
      default:
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
          text: 'text-yellow-500',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
          btnVariant: 'outline' as const
        };
    }
  };

  const getIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return TrendingUp;
      case 'sell':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const styles = getActionStyles(suggestion.action);
  const Icon = getIcon(suggestion.action);
  const priceChange = suggestion.target_price - suggestion.current_price;
  const priceChangePercent = (priceChange / suggestion.current_price) * 100;

  return (
    <div 
      className={`
        ${styles.bg} 
        border-2 rounded-xl p-5 
        transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-2xl
        animate-fade-in
        group
        relative overflow-hidden
      `}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent opacity-5" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-xl ${styles.text}`}>{suggestion.symbol}</h3>
              <Badge className={`${styles.badge} text-xs uppercase animate-pulse`}>
                {suggestion.action}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{suggestion.name}</p>
          </div>
          
          <div className={`
            p-3 rounded-lg ${styles.bg} border ${styles.badge}
            group-hover:scale-110 group-hover:rotate-12
            transition-all duration-300
          `}>
            <Icon className={`w-6 h-6 ${styles.icon}`} />
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-background/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Price</p>
            <p className="text-lg font-bold">{format(suggestion.current_price)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Target Price</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{format(suggestion.target_price)}</p>
              <Badge variant="outline" className={priceChange >= 0 ? 'text-success' : 'text-destructive'}>
                <Target className="w-3 h-3 mr-1" />
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Analysis:
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {suggestion.reason}
          </p>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Confidence:</p>
            <Badge variant="outline" className={`${styles.badge} text-xs`}>
              {Math.round(suggestion.confidence * 100)}%
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant={styles.btnVariant}
            className="group-hover:scale-105 transition-transform"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
