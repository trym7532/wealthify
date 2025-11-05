import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

function TrendIcon({ dir }: { dir?: string }) {
  if (dir === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
  if (dir === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export default function MarketAnalysis() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['market-analysis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data as any;
    },
    staleTime: 1000 * 60 * 60 * 12, // 12h
  });

  useEffect(() => {
    // Auto refetch daily if needed (client visit)
    const dayMs = 24 * 60 * 60 * 1000;
    const lastTime = data?.generated_at ? new Date(data.generated_at).getTime() : 0;
    if (!data || Date.now() - lastTime > dayMs) {
      refetch();
    }
  }, [data, refetch]);

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonLoader variant="card" count={2} />
      </div>
      <SkeletonLoader variant="list" count={3} />
    </div>
  );
  
  if (!data) return (
    <Card className="p-8 text-center border-dashed">
      <p className="text-muted-foreground">No market data available. Click refresh to load.</p>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Indian Indices - Nifty & Sensex */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.indices?.map((idx: any) => (
          <Card key={idx.name} className="group p-6 transition-all hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{idx.name}</h3>
                <p className="text-sm text-muted-foreground">{idx.summary}</p>
              </div>
              <div className={`p-2.5 rounded-lg transition-colors ${
                idx.direction === 'up' 
                  ? 'bg-success/15 text-success' 
                  : idx.direction === 'down' 
                  ? 'bg-destructive/15 text-destructive' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <TrendIcon dir={idx.direction} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`text-xl font-bold px-4 py-1.5 ${
                  idx.direction === 'up' 
                    ? 'bg-success/10 text-success border-success/30' 
                    : idx.direction === 'down' 
                    ? 'bg-destructive/10 text-destructive border-destructive/30' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx.change_percent != null ? `${idx.change_percent > 0 ? '+' : ''}${idx.change_percent}%` : '—'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Top Stocks */}
      {Array.isArray(data.today_top_stocks) && data.today_top_stocks.length > 0 && (
        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Today's Top Performing Stocks</h3>
          </div>
          <div className="grid gap-3">
            {data.today_top_stocks.map((s: any, i: number) => (
              <div 
                key={`${s.symbol}-${i}`} 
                className="flex items-center justify-between p-4 rounded-lg bg-surface/50 hover:bg-surface transition-all group border border-border/50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                    s.direction === 'up' ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'
                  }`}>
                    <TrendIcon dir={s.direction} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-1">{s.symbol}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{s.rationale}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-xs text-center text-muted-foreground pt-2">
        Last updated: {new Date(data.generated_at || Date.now()).toLocaleString()}
      </div>
    </div>
  );
}
