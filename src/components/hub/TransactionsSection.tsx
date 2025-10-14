import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddTransactionDialog from "./AddTransactionDialog";
import TransactionTable from "./TransactionTable";

export default function TransactionsSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*, linked_accounts(account_name)')
        .order('transaction_date', { ascending: false });

      if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]);
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('transaction_date', sevenDaysAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-surface border border-border text-sm"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : (
        <TransactionTable transactions={transactions || []} />
      )}

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}