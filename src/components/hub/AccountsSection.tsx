import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddAccountDialog from "./AddAccountDialog";
import AccountCard from "./AccountCard";
import InsightTooltip from "@/components/InsightTooltip";
import { motion } from "framer-motion";

export default function AccountsSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('linked_accounts')
        .update({ is_active: false })
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: "Account removed",
        description: "The account has been successfully removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading accounts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <InsightTooltip insight="Link your bank accounts to automatically track balances and transactions" showForNewUsers>
          <h2 className="text-2xl font-semibold">Bank Accounts</h2>
        </InsightTooltip>
        <InsightTooltip insight="Click here to connect a new bank account" type="tip" showForNewUsers>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Link Account
          </Button>
        </InsightTooltip>
      </div>

      {accounts && accounts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDelete={() => deleteMutation.mutate(account.id)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">No accounts linked yet</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline">
            Link your first account
          </Button>
        </div>
      )}

      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}