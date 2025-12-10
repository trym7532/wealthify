import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CURRENCIES, useCurrency } from "@/lib/currency";
import { ArrowRight } from "lucide-react";

interface CurrencyChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromCurrency: string;
  toCurrency: string;
  onConvert: () => void;
  onKeepValues: () => void;
}

export function CurrencyChangeDialog({
  open,
  onOpenChange,
  fromCurrency,
  toCurrency,
  onConvert,
  onKeepValues,
}: CurrencyChangeDialogProps) {
  const { rates } = useCurrency();
  const fromSymbol = CURRENCIES[fromCurrency as keyof typeof CURRENCIES]?.symbol || fromCurrency;
  const toSymbol = CURRENCIES[toCurrency as keyof typeof CURRENCIES]?.symbol || toCurrency;

  // Calculate conversion rate
  const getConversionRate = () => {
    if (!rates || Object.keys(rates).length === 0) return 1;
    const fromRate = fromCurrency === 'USD' ? 1 : rates[fromCurrency] || 1;
    const toRate = toCurrency === 'USD' ? 1 : rates[toCurrency] || 1;
    return toRate / fromRate;
  };

  const conversionRate = getConversionRate();
  const exampleAmounts = [100, 500, 1000];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Change Currency to {toCurrency}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>How would you like to handle your existing values?</p>
              
              {/* Conversion Preview */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Conversion Preview
                </p>
                <div className="space-y-2">
                  {exampleAmounts.map((amount) => (
                    <div 
                      key={amount} 
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {fromSymbol}{amount.toLocaleString()}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-primary font-medium">
                          {toSymbol}{(amount * conversionRate).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate: 1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}
                </p>
              </div>

              {/* Options explanation */}
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-foreground">Convert values:</strong>{" "}
                  <span className="text-muted-foreground">
                    {fromSymbol}100 → {toSymbol}{(100 * conversionRate).toFixed(2)}
                  </span>
                </p>
                <p>
                  <strong className="text-foreground">Keep same values:</strong>{" "}
                  <span className="text-muted-foreground">
                    {fromSymbol}100 → {toSymbol}100
                  </span>
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onKeepValues}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
          >
            Keep Same Values
          </AlertDialogAction>
          <AlertDialogAction onClick={onConvert}>
            Convert Values
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
