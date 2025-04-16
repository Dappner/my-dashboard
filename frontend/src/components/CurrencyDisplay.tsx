import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import type { SupportedCurrency } from "@/lib/currencyUtils";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  fromCurrency?: SupportedCurrency;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  fromCurrency,
  className,
}: CurrencyDisplayProps) {
  const { formatCurrency, displayCurrency } = useCurrencyConversion();

  // If the amount is 0, we can just show 0 in the display currency
  if (amount === 0) {
    return (
      <span className={cn("tabular-nums", className)}>
        {formatCurrency(0, displayCurrency)}
      </span>
    );
  }
  // Needs currencyConversion
  if (fromCurrency) {
    return (
      <span className={cn("tabular-nums", className)}>
        {formatCurrency(amount, fromCurrency)}
      </span>
    );
  }

  return (
    <span className={cn("tabular-nums", className)}>
      {formatCurrency(amount, displayCurrency)}
    </span>
  );
}
