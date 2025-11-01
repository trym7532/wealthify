import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import InsightTooltip from "@/components/InsightTooltip";

export default function InvestmentsSection() {
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

  useEffect(() => {
    // Fetch suggestions on mount if none exist or they're old
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke('update-stocks', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      queryClient.invalidateQueries({ queryKey: ['investments'] });
    } catch (error) {
      console.error('Error refreshing stocks:', error);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <InsightTooltip insight="Track all your investment accounts and monitor total portfolio value. Refreshes daily with AI-powered insights." showForNewUsers>
          <div>
            <h2 className="text-xl font-semibold">Investment Portfolio</h2>
            <p className="text-2xl font-bold mt-2">${totalValue.toFixed(2)}</p>
          </div>
        </InsightTooltip>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <InsightTooltip insight="Add your investment accounts to track portfolio growth" type="tip" showForNewUsers>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
            </InsightTooltip>
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
      </div>

      <div className="grid gap-4">
        {investments && investments.length > 0 ? (
          investments.map((investment) => {
            const value = parseFloat(investment.balance.toString());
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

            return (
              <div key={investment.id} className="card-surface">
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
              </div>
            );
          })
        ) : (
          <div className="card-surface text-center py-8">
            <p className="text-muted-foreground">No investment accounts yet. Add one to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
