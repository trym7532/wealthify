import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "Groceries", "Dining", "Transportation", "Entertainment", "Shopping",
  "Healthcare", "Utilities", "Rent", "Income", "Investment", "Other"
];

export default function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [formData, setFormData] = useState({
    account_id: "",
    amount: "",
    category: "",
    description: "",
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: "debit" as "credit" | "debit",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [userSetCategory, setUserSetCategory] = useState(false);

  const normalize = (str: string) =>
    str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

  const { data: accounts } = useQuery({
    queryKey: ['linked-accounts-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('id, account_name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: userBudgets } = useQuery({
    queryKey: ['user-budgets-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as { category: string }[];
      const { data, error } = await supabase
        .from('budgets')
        .select('category')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const combinedCategories = Array.from(new Set([...(userBudgets?.map(b => b.category) || []), ...CATEGORIES]));

  const keywordMap: Record<string, string> = {
    uber: 'Transportation', ola: 'Transportation', taxi: 'Transportation', fuel: 'Transportation', petrol: 'Transportation',
    walmart: 'Groceries', grocery: 'Groceries', groceries: 'Groceries', costco: 'Groceries', bigbasket: 'Groceries',
    starbucks: 'Dining', cafe: 'Dining', restaurant: 'Dining', mcdonalds: 'Dining', kfc: 'Dining',
    netflix: 'Entertainment', spotify: 'Entertainment', prime: 'Entertainment', cinema: 'Entertainment', movie: 'Entertainment',
    amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping',
    doctor: 'Healthcare', pharmacy: 'Healthcare', chemist: 'Healthcare', hospital: 'Healthcare',
    rent: 'Rent', landlord: 'Rent',
    electricity: 'Utilities', internet: 'Utilities', water: 'Utilities', gas: 'Utilities', broadband: 'Utilities',
    salary: 'Income', payroll: 'Income', deposit: 'Income',
    invest: 'Investment', broker: 'Investment', demat: 'Investment'
  };

  const inferCategory = (text: string): string | null => {
    const lowered = normalize(text);
    // Direct match with user's budget category names
    const budgetHit = (userBudgets || []).find(b => lowered.includes(normalize(b.category)));
    if (budgetHit) return budgetHit.category;
    // Keyword map
    for (const [k, v] of Object.entries(keywordMap)) {
      if (lowered.includes(k)) return v;
    }
    return null;
  };

  const suggestCategory = async () => {
    // If user already selected a category, do not override
    if (formData.category || userSetCategory) return;
    // Try local inference first
    const local = inferCategory(formData.description);
    if (local) {
      setFormData(prev => ({ ...prev, category: local }));
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('categorize-transaction', {
        body: { description: formData.description, amount: formData.amount },
      });
      if (!error && data?.category) {
        setFormData(prev => ({ ...prev, category: data.category }));
      }
    } catch (e) {
      // Silent fail; user can still pick manually
      console.warn('categorize-transaction failed', e);
    }
  };

  useEffect(() => {
    if (userSetCategory) return;
    if (!formData.description?.trim()) return;
    const lowered = normalize(formData.description);
    const hit = (userBudgets || []).find(b => lowered.includes(normalize(b.category)));
    if (hit && formData.category !== hit.category) {
      setFormData(prev => ({ ...prev, category: hit.category }));
    }
  }, [formData.description, userBudgets, userSetCategory]);

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Decide category automatically if not provided
      let finalCategory = data.category;
      if (!finalCategory) {
        const local = inferCategory(data.description);
        if (local) finalCategory = local;
        else {
          try {
            const { data: aiCat } = await supabase.functions.invoke('categorize-transaction', {
              body: { description: data.description, amount: data.amount },
            });
            if (aiCat?.category) finalCategory = aiCat.category;
          } catch {/* ignore */}
        }
      }

      const transactionAmount = data.transaction_type === 'credit' 
        ? Math.abs(parseFloat(data.amount))
        : -Math.abs(parseFloat(data.amount));

      // Insert transaction
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: data.account_id || null,
        amount: transactionAmount,
        transaction_type: data.transaction_type,
        category: finalCategory || 'Other',
        description: data.description,
        transaction_date: data.transaction_date,
      });
      
      if (txError) throw txError;

      // Update account balance if account is selected
      if (data.account_id) {
        const { data: account } = await supabase
          .from('linked_accounts')
          .select('balance')
          .eq('id', data.account_id)
          .single();

        if (account) {
          const newBalance = parseFloat(account.balance.toString()) + transactionAmount;
          
          const { error: updateError } = await supabase
            .from('linked_accounts')
            .update({ balance: newBalance })
            .eq('id', data.account_id);

          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-spending'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-budget-spending'] });
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded and balances updated",
      });
      onOpenChange(false);
      setFormData({
        account_id: "",
        amount: "",
        category: "",
        description: "",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "debit",
      });
      setUserSetCategory(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transaction_type">Transaction Type</Label>
            <Select 
              value={formData.transaction_type} 
              onValueChange={(value: "credit" | "debit") => setFormData({ ...formData, transaction_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (Money In)</SelectItem>
                <SelectItem value="debit">Debit (Money Out)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="50.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => { setUserSetCategory(true); setFormData({ ...formData, category: value }); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {combinedCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account_id">Account (Optional)</Label>
            <Select value={formData.account_id} onValueChange={(value) => setFormData({ ...formData, account_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transaction_date">Date</Label>
            <Input
              id="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={async () => {
                await suggestCategory();
              }}
              placeholder="Coffee at Starbucks"
            />
          </div>

          <Button type="submit" className="w-full" disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
