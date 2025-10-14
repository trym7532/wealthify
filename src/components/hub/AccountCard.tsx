import { Trash2, CreditCard, Wallet, TrendingUp, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountCardProps {
  account: any;
  onDelete: () => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  const getIcon = () => {
    switch (account.account_type) {
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      case 'savings': return <Wallet className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  return (
    <Card>
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
          <div className="text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {account.institution_name || 'No bank specified'}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {account.account_type.replace('_', ' ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}