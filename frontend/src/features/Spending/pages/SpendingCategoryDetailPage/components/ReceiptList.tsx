import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { spendingReceiptDetailRoute } from "@/routes/spending-routes";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-select";
import { ReceiptItemComponent } from "./ReceiptItemComponent";
import { parseDate } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

interface ReceiptListProps {
  isLoading: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: TODO : FIX
  receipts: any[];
  // biome-ignore lint/suspicious/noExplicitAny: TODO : FIX
  items: any[];
  categoryName: string;
  convertAmount: (amount: number, fromCurrency: string) => number;
}

export const ReceiptList = ({
  isLoading,
  receipts,
  items,
  categoryName,
  convertAmount,
}: ReceiptListProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Receipts with {categoryName || "this category"}</CardTitle>
      <CardDescription>Showing {receipts.length || 0} receipts</CardDescription>
    </CardHeader>
    <CardContent className="max-h-[400px] overflow-hidden">
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : receipts.length ? (
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {receipts.map((receipt) => {
              const receiptItems = items.filter(
                (item) => item.receipt_id === receipt.id,
              );

              // Calculate category total for this receipt with currency conversion
              const receiptCategoryTotal = receiptItems.reduce(
                (sum, item) =>
                  sum +
                  convertAmount(item.total_price || 0, receipt.currency_code),
                0,
              );

              return (
                <div
                  key={receipt.id}
                  className="border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={spendingReceiptDetailRoute.to}
                        params={{ receiptId: receipt.id }}
                        className="font-medium hover:underline"
                      >
                        {receipt.store_name || "Unknown Store"}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          parseDate(receipt.purchase_date),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        <CurrencyDisplay amount={receiptCategoryTotal} />
                      </p>
                      <p className="text-xs  text-muted-foreground">
                        <span>of </span>
                        <CurrencyDisplay
                          amount={receipt.total_amount}
                          fromCurrency={receipt.currency_code}
                        />
                        <span> total</span>
                      </p>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Category Items:</p>
                    {receiptItems.map((item) => (
                      <ReceiptItemComponent
                        key={item.id}
                        item={item}
                        receiptCurrency={receipt.currency_code}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          No receipts found
        </p>
      )}
    </CardContent>
  </Card>
);
