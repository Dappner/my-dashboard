import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DollarSignIcon,
  EuroIcon,
  PoundSterlingIcon,
  JapaneseYenIcon,
} from "lucide-react";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

// List of supported currencies
const currencies = [
  { code: "USD", label: "US Dollar", symbol: "$", icon: DollarSignIcon },
  { code: "EUR", label: "Euro", symbol: "€", icon: EuroIcon },
  { code: "GBP", label: "British Pound", symbol: "£", icon: PoundSterlingIcon },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", icon: JapaneseYenIcon },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", icon: DollarSignIcon },
  {
    code: "AUD",
    label: "Australian Dollar",
    symbol: "A$",
    icon: DollarSignIcon,
  },
  // { code: "CNY", label: "Chinese Yuan", symbol: "¥", icon: Chinese },
];

export function CurrencySelector({
  value,
  onValueChange,
  className,
}: CurrencySelectorProps) {
  return (
    <FormControl>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => {
            const Icon = currency.icon;
            return (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{currency.label}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({currency.symbol})
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </FormControl>
  );
}
