import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionTableProps {
  transactions: any[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
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
                <span className={parseFloat(tx.amount.toString()) >= 0 ? 'text-success' : 'text-foreground'}>
                  {parseFloat(tx.amount.toString()) >= 0 ? '+' : '-'}
                  ${Math.abs(parseFloat(tx.amount.toString())).toFixed(2)}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}