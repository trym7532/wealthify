import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import AddBudgetDialog from "./AddBudgetDialog";
import EditBudgetDialog from "./EditBudgetDialog";
import InsightTooltip from "../InsightTooltip";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

export default function BudgetsSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format } = useCurrency();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: spending } = useQuery({
    queryKey: ['budget-spending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfMonth.toISOString())
        .lt('amount', 0);

      if (error) throw error;

      const spendingByCategory: Record<string, number> = {};
      data.forEach(tx => {
        spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + Math.abs(tx.amount);
      });

      return spendingByCategory;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: "Budget deleted" });
    }
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading budgets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <InsightTooltip insight="Create budgets for categories like groceries, entertainment, or utilities" showForNewUsers>
          <h2 className="text-2xl font-semibold">Budget Management</h2>
        </InsightTooltip>
        <InsightTooltip insight="Set spending limits for different categories to control expenses" type="tip" showForNewUsers>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        </InsightTooltip>
      </div>

      <div className="grid gap-4">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget, index) => {
            const spent = spending?.[budget.category] || 0;
            const limit = typeof budget.limit_amount === 'string' 
              ? parseFloat(budget.limit_amount) 
              : budget.limit_amount;
            const percentage = (spent / limit) * 100;
            
            const getBudgetInsight = () => {
              if (percentage > 100) return { text: `You're over budget! Reduce ${budget.category} spending to get back on track.`, type: 'warning' as const };
              if (percentage > 80) return { text: `Approaching your limit. Monitor ${budget.category} spending closely.`, type: 'warning' as const };
              if (percentage < 50) return { text: `Good job! You're well within your ${budget.category} budget.`, type: 'success' as const };
              return { text: `Track your ${budget.category} expenses to stay on budget.`, type: 'info' as const };
            };
            
            const insight = getBudgetInsight();

            return (
              <InsightTooltip key={budget.id} insight={insight.text} type={insight.type}>
                <motion.div 
                  className="card-surface"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingBudget(budget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(budget.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">
                      {format(spent)} / {format(limit)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} />
                  {percentage > 100 && (
                    <p className="text-xs text-destructive">
                      Over budget by {format(spent - limit)}
                    </p>
                  )}
                </div>
                </motion.div>
              </InsightTooltip>
            );
          })
        ) : (
          <div className="card-surface text-center py-8">
            <p className="text-muted-foreground">No budgets set. Create one to start tracking.</p>
          </div>
        )}
      </div>

      <AddBudgetDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
      {editingBudget && (
        <EditBudgetDialog
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
          budget={editingBudget}
        />
      )}
    </div>
  );
}
