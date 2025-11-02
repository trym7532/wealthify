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
import StockSuggestionCard from "@/components/investments/StockSuggestionCard";
import MarketAnalysis from "@/components/investments/MarketAnalysis";

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

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['stock-suggestions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('stock_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    // Refresh on mount if none exist or last suggestion is stale (>24h)
    const dayMs = 24 * 60 * 60 * 1000;
    const lastTime = suggestions?.[0]?.generated_at ? new Date(suggestions[0].generated_at).getTime() : 0;
    if (!suggestions || suggestions.length === 0 || (Date.now() - lastTime > dayMs)) {
      handleRefresh();
    }
  }, [suggestions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.functions.invoke('update-stocks', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['stock-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: "Stock data updated successfully" });
    } catch (error) {
      console.error('Error refreshing stocks:', error);
      toast({ 
        title: "Failed to refresh stock data", 
        variant: "destructive" 
      });
    } finally {
      setIsRefreshing(false);
    }
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

      {/* Market Overview (AI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Market Overview</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating…' : 'Refresh All'}
          </Button>
        </div>
        {/* AI Market Analysis from backend */}
        <MarketAnalysis />
      </div>

      {/* AI-Powered Stock Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">AI-Powered Stock Analysis</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
        
        {suggestionsLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading AI suggestions...</p>
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <StockSuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No stock suggestions yet. Click Refresh to get AI-powered investment recommendations.
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? 'Analyzing...' : 'Get AI Suggestions'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
