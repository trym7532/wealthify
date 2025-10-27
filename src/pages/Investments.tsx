import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Investments() {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
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

  const { data: marketData, refetch: refetchMarket } = useQuery({
    queryKey: ['market-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-market-data');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: suggestionsData, refetch: refetchSuggestions } = useQuery({
    queryKey: ['investment-suggestions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('get-investment-suggestions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 3600000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchMarket();
    }, 30000);

    const dailyInterval = setInterval(() => {
      refetchSuggestions();
    }, 86400000);

    return () => {
      clearInterval(interval);
      clearInterval(dailyInterval);
    };
  }, [refetchMarket, refetchSuggestions]);

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
      queryClient.invalidateQueries({ queryKey: ['investment-suggestions'] });
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

  const handleRefreshAll = () => {
    refetchMarket();
    refetchSuggestions();
    toast({ title: "Refreshing market data..." });
  };

  const totalValue = investments?.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0) || 0;

  if (isLoading) {
    return <div className="text-muted-foreground">Loading investments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investments</h1>
          <p className="text-muted-foreground">Track your portfolio and market updates</p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh All
        </Button>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NIFTY 50</p>
              <p className="text-2xl font-bold">
                {marketData?.nifty?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${(marketData?.nifty?.change || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {(marketData?.nifty?.change || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">
                  {(marketData?.nifty?.change || 0) >= 0 ? '+' : ''}{marketData?.nifty?.change?.toFixed(2) || '—'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                ({(marketData?.nifty?.changePercent || 0) >= 0 ? '+' : ''}{marketData?.nifty?.changePercent?.toFixed(2) || '—'}%)
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SENSEX</p>
              <p className="text-2xl font-bold">
                {marketData?.sensex?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${(marketData?.sensex?.change || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {(marketData?.sensex?.change || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">
                  {(marketData?.sensex?.change || 0) >= 0 ? '+' : ''}{marketData?.sensex?.change?.toFixed(2) || '—'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                ({(marketData?.sensex?.changePercent || 0) >= 0 ? '+' : ''}{marketData?.sensex?.changePercent?.toFixed(2) || '—'}%)
              </p>
            </div>
          </div>
        </Card>
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Gainers Today</h2>
          <p className="text-xs text-muted-foreground">Updated every 30 seconds</p>
        </div>
        <div className="grid gap-3">
          {marketData?.topGainers?.map((stock: any) => (
            <Card key={stock.symbol} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{stock.symbol}</p>
                  <p className="text-xs text-muted-foreground">{stock.sector}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{stock.price.toFixed(2)}</p>
                  <p className="text-sm text-success">+{stock.change.toFixed(2)}%</p>
                </div>
              </div>
            </Card>
          )) || <p className="text-muted-foreground text-center py-4">Loading market data...</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">AI-Powered Investment Suggestions</h2>
          <p className="text-xs text-muted-foreground">Refreshed daily</p>
        </div>
        {suggestionsData?.userProfile && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Risk Profile</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {suggestionsData.userProfile.riskProfile}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="font-semibold">{suggestionsData.userProfile.savingsRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investments</p>
                <p className="font-semibold">${suggestionsData.userProfile.totalInvestments.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        )}
        <div className="grid gap-4">
          {suggestionsData?.suggestions?.map((suggestion: any, idx: number) => (
            <Card key={idx} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{suggestion.stock}</h3>
                      <Badge className={
                        suggestion.type === 'buy'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }>
                        {suggestion.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.name} • {suggestion.sector}</p>
                    <p className="text-sm text-muted-foreground mt-2">{suggestion.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm flex-wrap">
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
                  <div>
                    <p className="text-muted-foreground">Time Horizon</p>
                    <p className="font-semibold text-xs">{suggestion.timeHorizon}</p>
                  </div>
                </div>
              </div>
            </Card>
          )) || <p className="text-muted-foreground text-center py-4">Loading suggestions...</p>}
        </div>
      </div>
    </div>
  );
}
