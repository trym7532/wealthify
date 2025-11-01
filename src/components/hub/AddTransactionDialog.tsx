import { useState } from "react";
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

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const transactionAmount = data.transaction_type === 'credit' 
        ? Math.abs(parseFloat(data.amount))
        : -Math.abs(parseFloat(data.amount));

      // Insert transaction
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: data.account_id || null,
        amount: transactionAmount,
        transaction_type: data.transaction_type,
        category: data.category,
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
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
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
