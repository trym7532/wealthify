import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: any;
}

export default function EditBudgetDialog({ open, onOpenChange, budget }: EditBudgetDialogProps) {
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || "");
      setLimitAmount(budget.limit_amount?.toString() || "");
      setPeriod(budget.period || "monthly");
    }
  }, [budget]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('budgets')
        .update({
          category,
          limit_amount: parseFloat(limitAmount),
          period
        })
        .eq('id', budget.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-budgets'] });
      toast({ title: "Budget updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to update budget", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Groceries, Dining"
              required
            />
          </div>
          <div>
            <Label>Budget Limit</Label>
            <Input
              type="number"
              step="0.01"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : "Update Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
