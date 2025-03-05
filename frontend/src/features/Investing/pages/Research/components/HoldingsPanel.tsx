import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Holding } from '@/types/holdingsTypes';
import { TradeView } from '@/types/transactionsTypes';
import { transactionsApiKeys, transactionsApi } from '@/api/tradesApi';
import { useQuery } from '@tanstack/react-query';
import TransactionTable from '@/features/Investing/components/TransactionTable';

interface HoldingsPanelProps {
  holding: Holding;
  tickerTrades: TradeView[] | null;
  exchange: string;
  tickerSymbol: string;
}

export default function HoldingsPanel({
  holding,
  tickerTrades,
  exchange,
  tickerSymbol
}: HoldingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useSidebar();

  const { data: transactions = [] } = useQuery({
    queryKey: transactionsApiKeys.ticker(exchange, tickerSymbol!),
    queryFn: async () => transactionsApi.getTickerTrades(exchange!, tickerSymbol!),
    staleTime: 60 * 1000,
    retry: 2,
  });

  if (!holding) return null;

  return (
    <div className={`
      fixed bottom-0 z-50 pointer-events-none 
      left-[var(--sidebar-width)] 
      right-0
      ${state === 'collapsed' ? 'left-[var(--sidebar-width-icon)]' : ''}
      transition-all duration-300
    `}>
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
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>

          {/* Core KPIs in Flex Row */}
          <div className="grid text-base grid-cols-4 gap-2 p-3">
            <div>
              <p className="text-gray-500">Position</p>
              <p className="text-lg font-medium">{holding.shares?.toFixed(2) || '0'} (${holding.current_market_value?.toFixed(2) || '0.00'})</p>
            </div>
            <div>
              <p className="text-gray-500">Avg Price</p>
              <p className="text-lg font-medium">${holding.average_cost_basis?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-500">All Time</p>
              <p className={`text-lg font-medium ${(holding.total_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                ${holding.total_gain_loss?.toFixed(2) || '0.00'}
              </p>
              {/* TODO: Add Percent Change or Something */}
            </div>
            <div>
              {/* This could be left empty or used for another metric if needed */}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="p-3 space-y-4 border-t">
              {tickerTrades?.length ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
                  <TransactionTable transactions={transactions} />
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent transactions</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
