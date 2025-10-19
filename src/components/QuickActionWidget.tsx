import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Target, DollarSign, Building2, TrendingUp, Wallet } from "lucide-react";
import AddTransactionDialog from "./hub/AddTransactionDialog";
import AddGoalDialog from "./hub/AddGoalDialog";
import AddAccountDialog from "./hub/AddAccountDialog";
import AddBudgetDialog from "./hub/AddBudgetDialog";

interface QuickActionWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickActionWidget({ open, onOpenChange }: QuickActionWidgetProps) {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);

  const actions = [
    {
      id: "transaction",
      label: "Add Transaction",
      icon: DollarSign,
      description: "Record a new transaction",
      onClick: () => {
        setShowTransactionDialog(true);
        onOpenChange(false);
      },
    },
    {
      id: "goal",
      label: "Create Goal",
      icon: Target,
      description: "Set a new financial goal",
      onClick: () => {
        setShowGoalDialog(true);
        onOpenChange(false);
      },
    },
    {
      id: "budget",
      label: "Create Budget",
      icon: Wallet,
      description: "Set spending limits by category",
      onClick: () => {
        setShowBudgetDialog(true);
        onOpenChange(false);
      },
    },
    {
      id: "investment",
      label: "Add Investment",
      icon: TrendingUp,
      description: "Track your investment accounts",
      onClick: () => {
        setShowInvestmentDialog(true);
        onOpenChange(false);
      },
    },
    {
      id: "account",
      label: "Link Account",
      icon: Building2,
      description: "Add a new bank account",
      onClick: () => {
        setShowAccountDialog(true);
        onOpenChange(false);
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <AddTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      />
      <AddGoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
      />
      <AddBudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
      />
      <AddAccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />
      <AddAccountDialog
        open={showInvestmentDialog}
        onOpenChange={setShowInvestmentDialog}
      />
    </>
  );
}
