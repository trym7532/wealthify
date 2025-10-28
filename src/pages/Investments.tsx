import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, RefreshCw, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export default function Investments() {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_type', 'investment')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: stockData, refetch: refetchStockData } = useQuery({
    queryKey: ['stock-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stock-data?action=all`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      return await response.json();
    },
    refetchInterval: 60000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStockData();
      toast({ title: "Market data refreshed", description: "Latest stock prices updated" });
    } catch (error) {
      toast({ title: "Failed to refresh", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetchStockData();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchStockData]);

  const marketData = stockData?.market || { nifty: { value: 0, change: 0, changePercent: 0 }, sensex: { value: 0, change: 0, changePercent: 0 } };
  const topGainers = stockData?.topGainers || [];
  const suggestions = stockData?.suggestions || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('linked_accounts').insert({
        user_id: user.id,
        account_name: accountName,
        account_type: 'investment',
        balance: parseFloat(balance),
        institution_name: institution,
        is_active: true
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-accounts'] });
      toast({ title: "Investment account added" });
      setOpen(false);
      setAccountName("");
      setBalance("");
      setInstitution("");
    },
    onError: () => {
      toast({ title: "Failed to add investment", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const totalValue = investments?.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0) || 0;

  if (isLoading) {
    return <div className="text-muted-foreground">Loading investments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investments</h1>
        <p className="text-muted-foreground">Track your portfolio and market updates</p>
      </div>

      {/* Market Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Market Overview</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NIFTY 50</p>
                <p className="text-2xl font-bold">{marketData.nifty.value.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${marketData.nifty.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {marketData.nifty.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {marketData.nifty.change >= 0 ? '+' : ''}{marketData.nifty.change.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ({marketData.nifty.changePercent >= 0 ? '+' : ''}{marketData.nifty.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SENSEX</p>
                <p className="text-2xl font-bold">{marketData.sensex.value.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${marketData.sensex.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {marketData.sensex.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {marketData.sensex.change >= 0 ? '+' : ''}{marketData.sensex.change.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ({marketData.sensex.changePercent >= 0 ? '+' : ''}{marketData.sensex.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {stockData?.timestamp && (
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(stockData.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* My Portfolio */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">My Portfolio</h2>
            <p className="text-2xl font-bold mt-2">${totalValue.toFixed(2)}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Investment Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g., Vanguard 401k"
                    required
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g., Vanguard"
                    required
                  />
                </div>
                <div>
                  <Label>Current Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Investment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {investments && investments.length > 0 ? (
            investments.map((investment) => {
              const value = parseFloat(investment.balance.toString());
              const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

              return (
                <Card key={investment.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{investment.account_name}</h3>
                      <p className="text-sm text-muted-foreground">{investment.institution_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${value.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% of portfolio
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No investment accounts yet. Add one to start tracking.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Top Gainers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Top Gainers Today</h2>
        <div className="grid gap-3">
          {topGainers.length > 0 ? (
            topGainers.map((stock: any) => (
              <Card key={stock.symbol} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{stock.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stock.price.toFixed(2)}</p>
                    <p className="text-sm text-success">+{stock.changePercent.toFixed(2)}%</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading market data...</p>
            </Card>
          )}
        </div>
      </div>

      {/* Investment Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">AI-Powered Investment Suggestions</h2>
        </div>
        <p className="text-sm text-muted-foreground">Based on market analysis and trending stocks. Updates daily with fresh recommendations.</p>
        <div className="grid gap-4">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion: any, idx: number) => (
              <Card key={idx} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{suggestion.stock}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          suggestion.type === 'buy'
                            ? 'bg-success/10 text-success'
                            : suggestion.type === 'hold'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {suggestion.type.toUpperCase()}
                        </span>
                        {suggestion.sector && (
                          <span className="text-xs px-2 py-1 rounded bg-muted">
                            {suggestion.sector}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold">₹{suggestion.current}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold text-success">₹{suggestion.target}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Upside</p>
                      <p className="font-semibold text-success">
                        {(((suggestion.target - suggestion.current) / suggestion.current) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Loading investment suggestions...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
