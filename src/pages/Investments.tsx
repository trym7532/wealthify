import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
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

  // Mock market data - in production, this would call a real stock API
  const marketData = {
    nifty: { value: 21453.25, change: 145.30, changePercent: 0.68 },
    sensex: { value: 70721.45, change: 412.75, changePercent: 0.59 },
    topGainers: [
      { symbol: "RELIANCE", price: 2456.30, change: 3.45, sector: "Energy" },
      { symbol: "TCS", price: 3678.50, change: 2.89, sector: "IT" },
      { symbol: "INFY", price: 1543.20, change: 2.12, sector: "IT" },
    ],
    suggestions: [
      { 
        stock: "HDFCBANK", 
        reason: "Strong quarterly results with improved NIM", 
        type: "buy",
        target: 1850,
        current: 1642
      },
      { 
        stock: "ITC", 
        reason: "Consistent dividend payer, stable FMCG business", 
        type: "hold",
        target: 485,
        current: 462
      },
      { 
        stock: "BHARTIARTL", 
        reason: "5G rollout momentum, improving ARPU", 
        type: "buy",
        target: 1450,
        current: 1287
      },
    ]
  };

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
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid gap-3">
          {marketData.topGainers.map((stock) => (
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
          ))}
        </div>
      </div>

      {/* Investment Suggestions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">AI-Powered Suggestions</h2>
        <div className="grid gap-4">
          {marketData.suggestions.map((suggestion, idx) => (
            <Card key={idx} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{suggestion.stock}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.type === 'buy' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {suggestion.type.toUpperCase()}
                      </span>
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
          ))}
        </div>
      </div>
    </div>
  );
}
