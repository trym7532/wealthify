import { Trash2, CreditCard, Wallet, TrendingUp, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface AccountCardProps {
  account: any;
  onDelete: () => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  const { format } = useCurrency();
  
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
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card className="overflow-hidden">
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
  );
}