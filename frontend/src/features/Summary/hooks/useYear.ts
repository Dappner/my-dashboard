import { useState, useEffect } from "react";
import { usePortfolioMetrics } from "@/features/Investing/hooks/usePortfolioMetrics";
import { useSpendingMetrics } from "@/features/Spending/hooks/useSpendingMetrics";
import { useTimeframeSummary } from "@/features/Habits/pages/ChessPage/hooks/useChessHooks";
interface YearSummaryData {
  portfolio: {
    value: number;
    return: number;
  } | null;
  spending: {
    total: number;
    receipts: number;
    topCategory?: string;
  } | null;
  chess: {
    gamesPlayed: number;
    winRate: number;
  } | null;
  books: {
    count: number;
    avgPerMonth: number;
  } | null;
}

export function useYearSummary(currentDate: Date) {
  const [summaryData, setSummaryData] = useState<YearSummaryData>({
    portfolio: null,
    spending: null,
    chess: null,
    books: null,
  });

  // Get data from hooks
  const { metrics: portfolioMetrics } = usePortfolioMetrics();
  const { spendingMetrics } = useSpendingMetrics(currentDate);
  const { data: chessMetrics } = useTimeframeSummary(currentDate, "YTD");

  // Update summary data when metrics change
  useEffect(() => {
    const newSummaryData: YearSummaryData = {
      portfolio: portfolioMetrics
        ? {
          value: portfolioMetrics.totalMarketValue || 0,
          return: portfolioMetrics.totalReturn || 0,
        }
        : null,
      spending: spendingMetrics
        ? {
          total: spendingMetrics.totalSpent || 0,
          receipts: spendingMetrics.receiptCount || 0,
          topCategory: spendingMetrics.categories?.[0]?.name,
        }
        : null,
      chess: chessMetrics
        ? {
          gamesPlayed: chessMetrics.total_games || 0,
          winRate: chessMetrics.win_rate_pct || 0,
        }
        : null,
      // Mock books data for now
      books: {
        count: Math.floor((currentDate.getMonth() + 1) * 2),
        avgPerMonth: 2,
      },
    };

    setSummaryData(newSummaryData);
  }, [portfolioMetrics, spendingMetrics, chessMetrics, currentDate]);

  return summaryData;
}
