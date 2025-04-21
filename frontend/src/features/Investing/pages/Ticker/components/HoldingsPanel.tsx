import { useSidebar } from "@/components/layout/Sidebar/providers/SidebarProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionTable from "@/features/Investing/components/TransactionTable";
import { useTransactions } from "@/features/Investing/hooks/useTransactions";
import { cn } from "@/lib/utils";
import type { Holding, TradeView } from "@my-dashboard/shared";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface HoldingsPanelProps {
  holding: Holding;
  tickerTrades: TradeView[] | null;
  exchange: string;
  tickerSymbol: string;
  isLoading?: boolean;
}
// DESKTOP ONLY
export default function HoldingsPanel({
  holding,
  exchange,
  tickerSymbol,
  isLoading = false,
}: HoldingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useSidebar();

  const { transactions, isLoading: transactionsLoading } = useTransactions({
    queryOptions: {
      ticker: { exchange, tickerSymbol },
    },
  });

  if (!holding && !isLoading) return null;

  return (
    <div
      className={cn(
        "fixed z-50 pointer-events-none",
        "bottom-0 right-0",
        state === "collapsed" ? "left-[63px]" : "left-[255px]",
        "transition-all duration-300",
      )}
    >
      <div className="max-w-full pointer-events-auto">
        <div
          className={cn(
            " border-t border-l",
            "bg-gradient-to-br from-white to-blue-50", // Light mode
            "dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700", // Dark mode
          )}
        >
          {/* Header with toggle */}
          <div className="flex items-center gap-2 p-3 border-b">
            <h3 className="text-lg font-semibold">Holdings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary"
            >
              {isExpanded ? (
                <ChevronDown className="size-5" />
              ) : (
                <ChevronUp className="size-5" />
              )}
            </Button>
          </div>

          {/* Core KPIs in Flex Row */}
          <div className="grid text-base grid-cols-2 sm:grid-cols-4 gap-2 p-3">
            {isLoading ? (
              // Loading state for KPIs
              <>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <Skeleton className="h-6 w-24 mt-1" />
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Price</p>
                  <Skeleton className="h-6 w-20 mt-1" />
                </div>
                <div>
                  <p className="text-muted-foreground">All Time</p>
                  <Skeleton className="h-6 w-24 mt-1" />
                </div>
                <div />
              </>
            ) : (
              // Normal data display
              <>
                <div>
                  <p className="text-muted-foreground">
                    Shares (Total Market Value)
                  </p>
                  <p className="text-lg font-medium">
                    {holding.shares?.toFixed(2) || "0"} ($
                    {holding.current_market_value?.toFixed(2) || "0.00"})
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Price</p>
                  <p className="text-lg font-medium">
                    ${holding.average_cost_basis?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unrealized P/L</p>
                  <p
                    className={`text-lg font-medium ${(holding.unrealized_gain_loss || 0) >= 0
                        ? "text-success-foreground"
                        : "text-destructive-foreground"
                      }`}
                  >
                    ${holding.unrealized_gain_loss?.toFixed(2) || "0.00"}
                    <span className="ml-1 text-base">
                      (
                      {holding.unrealized_gain_loss_percent?.toFixed(2) ||
                        "0.00"}
                      %)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Dividends</p>
                  <p className="text-lg font-medium">
                    ${holding.total_dividends_received?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div />
              </>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="pt-2 sm:p-3 space-y-4 border-t">
              <div>
                <h3 className="text-lg px-2 font-semibold mb-2">
                  Recent Transactions
                </h3>
                <TransactionTable
                  isGlobal={false}
                  isLoading={transactionsLoading}
                  transactions={transactions}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
