import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, RefreshCw, Briefcase, PieChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import StockSuggestionCard from "@/components/investments/StockSuggestionCard";
import MarketAnalysis from "@/components/investments/MarketAnalysis";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";
import FloatingIcons from "@/components/ui/FloatingIcons";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function Investments() {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format, currency } = useCurrency();

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <FloatingIcons variant="minimal" className="opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 relative z-10"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl glass p-8 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Investments
              </h1>
              <p className="text-muted-foreground">AI-powered portfolio insights and market analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="glass p-6 border border-white/5 col-span-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                <div className="text-4xl font-bold text-primary">
                  <AnimatedCounter value={totalValue} prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '$'} duration={1.5} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
              >
                <Briefcase className="w-7 h-7 text-primary" />
              </motion.div>
            </div>
            <div className="mt-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Investment Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border border-white/10">
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
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g., Vanguard"
                        className="bg-background/50"
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
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Adding...' : 'Add Investment'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <Card className="glass p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Accounts</p>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"
              >
                <PieChart className="w-5 h-5 text-accent" />
              </motion.div>
            </div>
            <div className="text-3xl font-bold">
              <AnimatedCounter value={investments?.length || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Investment accounts</p>
          </Card>
        </motion.div>

        {/* Market Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold">Market Overview</h2>
          <MarketAnalysis />
        </motion.div>

        {/* Investment Accounts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold">My Portfolio</h2>
          <div className="grid gap-4">
            {investments && investments.length > 0 ? (
              investments.map((investment, index) => {
                const value = parseFloat(investment.balance.toString());
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="glass p-4 border border-white/5 hover:border-primary/20 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                          >
                            <TrendingUp className="w-6 h-6 text-primary" />
                          </motion.div>
                          <div>
                            <h3 className="font-semibold">{investment.account_name}</h3>
                            <p className="text-sm text-muted-foreground">{investment.institution_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{format(value)}</p>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of portfolio
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card className="glass p-8 text-center border-dashed border-white/10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center"
                >
                  <TrendingUp className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-muted-foreground mb-4">No investment accounts yet</p>
                <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Investment
                </Button>
              </Card>
            )}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold">AI-Powered Recommendations</h2>
          
          {suggestionsLoading ? (
            <Card className="glass p-8 text-center border border-white/5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </div>
            </Card>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="grid gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <StockSuggestionCard suggestion={suggestion} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass p-8 text-center border-dashed border-white/10">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <TrendingUp className="w-8 h-8 text-primary" />
              </motion.div>
              <p className="font-semibold mb-2">Get Personalized Recommendations</p>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI analyzes market trends to provide tailored suggestions
              </p>
              <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Analyzing...' : 'Generate Recommendations'}
              </Button>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
