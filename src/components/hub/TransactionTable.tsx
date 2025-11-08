import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface TransactionTableProps {
  transactions: any[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format } = useCurrency();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] });
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed and balances updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <motion.tr 
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="border-b border-border hover:bg-accent/5 transition-colors"
            >
              <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
              <TableCell>{tx.description || 'N/A'}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-sm">
                  {tx.category}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {tx.linked_accounts?.account_name || 'N/A'}
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span className={parseFloat(tx.amount.toString()) >= 0 ? 'text-success' : 'text-destructive'}>
                  {parseFloat(tx.amount.toString()) >= 0 ? '+' : ''}
                  {format(parseFloat(tx.amount.toString()))}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(tx.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}