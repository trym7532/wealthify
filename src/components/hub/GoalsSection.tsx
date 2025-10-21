import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddGoalDialog from "./AddGoalDialog";
import GoalCard from "./GoalCard";
import InsightTooltip from "@/components/InsightTooltip";

export default function GoalsSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['financial-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <InsightTooltip insight="Set financial goals like saving for a house, vacation, or emergency fund" showForNewUsers>
          <h2 className="text-2xl font-semibold">Financial Goals</h2>
        </InsightTooltip>
        <InsightTooltip insight="Create a new financial goal to stay motivated and track progress" type="tip" showForNewUsers>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </InsightTooltip>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading goals...</div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">No financial goals set yet</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline">
            Create your first goal
          </Button>
        </div>
      )}

      <AddGoalDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}