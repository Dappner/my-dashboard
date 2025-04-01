import { transactionsApi, transactionsApiKeys } from "@/api/tradesApi";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionTable from "@/features/Investing/components/TransactionTable";
import type { Holding } from "@/types/holdingsTypes";
import type { TradeView } from "@/types/transactionsTypes";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface HoldingsPanelProps {
  holding: Holding;
  tickerTrades: TradeView[] | null;
  exchange: string;
  tickerSymbol: string;
  isLoading?: boolean;
}

export default function HoldingsPanel({
  holding,
  exchange,
  tickerSymbol,
  isLoading = false,
}: HoldingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useSidebar();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: transactionsApiKeys.ticker(exchange, tickerSymbol),
    queryFn: async () =>
      transactionsApi.getTickerTrades(exchange, tickerSymbol),
    staleTime: 60 * 1000,
    retry: 2,
  });

  if (!holding && !isLoading) return null;

  return (
    <div
      className={`
      fixed bottom-0 z-50 pointer-events-none 
      left-[var(--sidebar-width)] 
      right-0
      ${state === "collapsed" ? "left-[var(--sidebar-width-icon)]" : ""}
      transition-all duration-300
    `}
    >
      <div className="max-w-full pointer-events-auto">
        <div className="bg-white border-t border-r rounded-r-sm shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
          {/* Header with toggle */}
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-lg font-semibold">Holdings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-gray-100"
            >
              {isExpanded
                ? <ChevronDown className="h-5 w-5 text-gray-600" />
                : <ChevronUp className="h-5 w-5 text-gray-600" />}
            </Button>
          </div>

          {/* Core KPIs in Flex Row */}
          <div className="grid text-base grid-cols-4 gap-2 p-3">
            {isLoading
              ? (
                // Loading state for KPIs
                <>
                  <div>
                    <p className="text-gray-500">Position</p>
                    <Skeleton className="h-6 w-24 mt-1" />
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Price</p>
                    <Skeleton className="h-6 w-20 mt-1" />
                  </div>
                  <div>
                    <p className="text-gray-500">All Time</p>
                    <Skeleton className="h-6 w-24 mt-1" />
                  </div>
                  <div />
                </>
              )
              : (
                // Normal data display
                <>
                  <div>
                    <p className="text-gray-500">Shares (Total Market Value)</p>
                    <p className="text-lg font-medium">
                      {holding.shares?.toFixed(2) || "0"} ($
                      {holding.current_market_value?.toFixed(2) || "0.00"})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Price</p>
                    <p className="text-lg font-medium">
                      ${holding.average_cost_basis?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Unrealized P/L</p>
                    <p
                      className={`text-lg font-medium ${
                        (holding.unrealized_gain_loss || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
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
                    <p className="text-gray-500">Total Dividends</p>
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
            <div className="p-3 space-y-4 border-t">
              <div>
                <h3 className="text-lg font-semibold mb-2">
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
