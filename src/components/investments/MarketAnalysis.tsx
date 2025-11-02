import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
    refetch();
  }, [refetch]);

  if (isLoading) return <Card className="p-4">Loading market overview…</Card>;
  if (!data) return <Card className="p-4">No market data available.</Card>;

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">India Indices</h3>
          <span className="text-xs text-muted-foreground">Updated {new Date(data.generated_at || Date.now()).toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.indices?.map((idx: any) => (
            <div key={idx.name} className="p-3 rounded-lg bg-surface flex items-center justify-between">
              <div>
                <div className="font-medium">{idx.name}</div>
                <div className="text-xs text-muted-foreground">{idx.summary}</div>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon dir={idx.direction} />
                <Badge variant="outline" className={idx.direction === 'up' ? 'text-success border-success' : idx.direction === 'down' ? 'text-destructive border-destructive' : ''}>
                  {idx.change_percent != null ? `${idx.change_percent}%` : '—'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {Array.isArray(data.today_top_stocks) && data.today_top_stocks.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Today’s Top Stocks (AI)</h3>
          <div className="grid gap-3">
            {data.today_top_stocks.map((s: any, i: number) => (
              <div key={`${s.symbol}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                <div className="font-medium">{s.symbol}</div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendIcon dir={s.direction} />
                  <span className="text-muted-foreground">{s.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}