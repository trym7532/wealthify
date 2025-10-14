import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [formData, setFormData] = useState({
    goal_name: "",
    goal_type: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
    priority: "medium",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('financial_goals').insert({
        user_id: user.id,
        goal_name: data.goal_name,
        goal_type: data.goal_type,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount) || 0,
        target_date: data.target_date || null,
        priority: data.priority,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] });
      toast({
        title: "Goal created",
        description: "Your financial goal has been added",
      });
      onOpenChange(false);
      setFormData({
        goal_name: "",
        goal_type: "",
        target_amount: "",
        current_amount: "",
        target_date: "",
        priority: "medium",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal_name">Goal Name</Label>
            <Input
              id="goal_name"
              value={formData.goal_name}
              onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
              placeholder="Emergency Fund"
              required
            />
          </div>

          <div>
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target_amount">Target Amount</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              placeholder="10000.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="current_amount">Current Amount</Label>
            <Input
              id="current_amount"
              type="number"
              step="0.01"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="target_date">Target Date (Optional)</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={addMutation.isPending}>
            {addMutation.isPending ? "Creating..." : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}