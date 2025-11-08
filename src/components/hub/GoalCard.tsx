import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2, Target, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditGoalDialog from "./EditGoalDialog";
import InsightTooltip from "../InsightTooltip";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface GoalCardProps {
  goal: any;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { format } = useCurrency();
  const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
  
  // Generate contextual insights
  const getGoalInsight = () => {
    if (progress >= 90) return { text: "Almost there! Just a little more to reach your goal!", type: 'success' as const };
    if (progress >= 50) return { text: "You're halfway there! Keep up the great work!", type: 'success' as const };
    if (progress < 25) return { text: "Start contributing regularly to build momentum towards your goal", type: 'info' as const };
    return { text: "You're making progress! Stay consistent with contributions", type: 'info' as const };
  };
  
  const insight = getGoalInsight();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] });
      toast({
        title: "Goal deleted",
        description: "The financial goal has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-accent';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <InsightTooltip insight={insight.text} type={insight.type}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                {goal.goal_name}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate()}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(parseFloat(goal.current_amount))}
                  </span>
                  <span className="text-muted-foreground">
                    {format(parseFloat(goal.target_amount))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-1 rounded-md bg-surface capitalize">
                  {goal.goal_type.replace('_', ' ')}
                </span>
                <span className={`font-semibold capitalize ${getPriorityColor()}`}>
                  {goal.priority} priority
                </span>
              </div>

              {goal.target_date && (
                <div className="text-xs text-muted-foreground">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </InsightTooltip>
    
      <EditGoalDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        goal={goal}
      />
    </>
  );
}