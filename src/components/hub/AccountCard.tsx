import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, CreditCard, Wallet, TrendingUp, Building, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";

interface AccountCardProps {
  account: any;
  onDelete: () => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  const { format } = useCurrency();
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { data: recentTransactions } = useQuery({
    queryKey: ['account-transactions', account.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', account.id)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });
  
  const getIcon = () => {
    switch (account.account_type) {
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      case 'savings': return <Wallet className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full"
      >
        {/* Front Side */}
        <motion.div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0"
        >
          <Card className="overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getIcon()}
                {account.account_name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-muted-foreground hover:text-error"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {format(parseFloat(account.balance))}
                </motion.div>
                <div className="text-xs text-muted-foreground">
                  {account.institution_name || 'No bank specified'}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {account.account_type.replace('_', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Side */}
        <motion.div
          style={{ 
            backfaceVisibility: "hidden",
            rotateY: 180,
          }}
          className="absolute inset-0"
        >
          <Card className="overflow-hidden h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        {tx.transaction_type === 'expense' ? (
                          <ArrowDownRight className="w-3 h-3 text-destructive" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-success" />
                        )}
                        <span className="truncate max-w-[100px]">{tx.description}</span>
                      </div>
                      <span className={tx.transaction_type === 'expense' ? 'text-destructive' : 'text-success'}>
                        {format(tx.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}