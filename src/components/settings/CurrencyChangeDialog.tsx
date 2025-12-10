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
import { CURRENCIES } from "@/lib/currency";

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
  const fromSymbol = CURRENCIES[fromCurrency]?.symbol || fromCurrency;
  const toSymbol = CURRENCIES[toCurrency]?.symbol || toCurrency;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Currency to {toCurrency}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>How would you like to handle your existing values?</p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
              <p>
                <strong>Convert values:</strong> Your {fromSymbol}100 will be converted to the equivalent in {toSymbol} based on current exchange rates.
              </p>
              <p>
                <strong>Keep same values:</strong> Your {fromSymbol}100 will become {toSymbol}100 (same number, different currency).
              </p>
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
