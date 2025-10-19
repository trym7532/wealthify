import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: any;
}

export default function EditGoalDialog({ open, onOpenChange, goal }: EditGoalDialogProps) {
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (goal) {
      setGoalName(goal.goal_name || "");
      setGoalType(goal.goal_type || "");
      setCurrentAmount(goal.current_amount?.toString() || "");
      setTargetAmount(goal.target_amount?.toString() || "");
      setTargetDate(goal.target_date || "");
      setPriority(goal.priority || "medium");
    }
  }, [goal]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          goal_name: goalName,
          goal_type: goalType,
          current_amount: parseFloat(currentAmount),
          target_amount: parseFloat(targetAmount),
          target_date: targetDate || null,
          priority
        })
        .eq('id', goal.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
      toast({ title: "Goal updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
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
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Goal Name</Label>
            <Input
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>
          <div>
            <Label>Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="debt_payment">Debt Payment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Current Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Target Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Target Date (Optional)</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : "Update Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
