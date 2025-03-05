import { PortfolioDailyMetric } from "@/types/portfolioDailyMetricTypes";

export const calculatePortfolioMetrics = (dailyMetrics: PortfolioDailyMetric[]) => {
  if (!dailyMetrics?.length) {
    return {
      totalPortfolioValue: 0,
      investmentValue: 0,
      cashBalance: 0,
      monthChange: 0,
      monthChangePercent: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      cashPercentage: 0,
    };
  }

  const currentMetrics = dailyMetrics[dailyMetrics.length - 1];
  const previousMetrics = dailyMetrics[0];

  const investmentValue = currentMetrics.portfolio_value || 0;
  const cashBalance = currentMetrics.cash_balance || 0;
  const totalPortfolioValue = currentMetrics.total_portfolio_value || 0;

  const portfolioCostBasis = currentMetrics.cost_basis || 0;
  const previousTotalPortfolioValue = previousMetrics.total_portfolio_value || totalPortfolioValue;

  const monthChange = totalPortfolioValue - previousTotalPortfolioValue;
  const monthChangePercent = previousTotalPortfolioValue > 0
    ? (monthChange / previousTotalPortfolioValue) * 100
    : 0;

  const totalReturn = investmentValue - portfolioCostBasis;
  const totalReturnPercent = portfolioCostBasis > 0
    ? (totalReturn / portfolioCostBasis) * 100
    : 0;

  const cashPercentage = totalPortfolioValue > 0
    ? (cashBalance / totalPortfolioValue) * 100
    : 0;

  return {
    totalPortfolioValue,
    investmentValue,
    cashBalance,
    monthChange,
    monthChangePercent,
    totalReturn,
    totalReturnPercent,
    cashPercentage,
  };
};
