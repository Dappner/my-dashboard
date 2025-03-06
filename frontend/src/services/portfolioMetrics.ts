import { PortfolioDailyMetric, Timeframe } from "@/types/portfolioDailyMetricTypes";

export const calculatePortfolioMetrics = (dailyMetrics: PortfolioDailyMetric[], timeframe: Timeframe) => {
  if (!dailyMetrics?.length) {
    return {
      totalPortfolioValue: 0,
      investmentValue: 0,
      cashBalance: 0,
      timeframeChange: 0,
      timeframeChangePercent: 0,
      timeframeReturn: 0,
      timeframeReturnPercent: 0,
      cashPercentage: 0,
      investmentGrowth: 0,
      investmentGrowthPercent: 0,
      volatility: 0,
    };
  }

  // Current (latest) and first metrics
  const currentMetrics = dailyMetrics[dailyMetrics.length - 1];
  const firstMetrics = dailyMetrics[0];

  const totalPortfolioValue = Number(currentMetrics.total_portfolio_value || 0);
  const investmentValue = Number(currentMetrics.portfolio_value || 0);
  const cashBalance = Number(currentMetrics.cash_balance || 0);
  const portfolioCostBasis = Number(currentMetrics.cost_basis || 0);

  const previousTotalPortfolioValue = Number(firstMetrics.total_portfolio_value || totalPortfolioValue);
  const previousInvestmentValue = Number(firstMetrics.portfolio_value || investmentValue);
  const previousCashBalance = Number(firstMetrics.cash_balance || cashBalance);

  // Timeframe-dependent change (total portfolio, including cash)
  const timeframeChange = totalPortfolioValue - previousTotalPortfolioValue;
  const timeframeChangePercent = previousTotalPortfolioValue > 0
    ? (timeframeChange / previousTotalPortfolioValue) * 100
    : 0;

  // Timeframe-dependent return (investment only)
  let timeframeReturn: number;
  let timeframeReturnPercent: number;
  if (timeframe === "ALL") {
    // For "ALL," use current portfolio value minus initial cost basis
    timeframeReturn = investmentValue - portfolioCostBasis;
    timeframeReturnPercent = portfolioCostBasis > 0
      ? (timeframeReturn / portfolioCostBasis) * 100
      : 0;
  } else {
    // For other timeframes, use change in portfolio_value
    timeframeReturn = investmentValue - previousInvestmentValue;
    timeframeReturnPercent = previousInvestmentValue > 0
      ? (timeframeReturn / previousInvestmentValue) * 100
      : 0;
  }

  // Cash percentage
  const cashPercentage = totalPortfolioValue > 0
    ? (cashBalance / totalPortfolioValue) * 100
    : 0;

  // Investment Growth (net of cash changes over the timeframe)
  const cashChange = cashBalance - previousCashBalance;
  const investmentGrowth = (totalPortfolioValue - cashBalance) - (previousTotalPortfolioValue - previousCashBalance);
  const investmentGrowthPercent = previousInvestmentValue > 0
    ? (investmentGrowth / previousInvestmentValue) * 100
    : 0;

  // Volatility (standard deviation of daily investment returns)
  const volatility = calculateVolatility(dailyMetrics);

  return {
    totalPortfolioValue,
    investmentValue,
    cashBalance,
    timeframeChange,
    timeframeChangePercent,
    timeframeReturn,
    timeframeReturnPercent,
    cashPercentage,
    investmentGrowth,
    investmentGrowthPercent,
    volatility,
  };
};

// Calculate volatility (standard deviation of daily investment returns)
const calculateVolatility = (metrics: PortfolioDailyMetric[]): number => {
  if (metrics.length < 2) return 0;

  const dailyReturns = metrics.slice(1).map((current, index) => {
    const previous = metrics[index];
    const prevValue = Number(previous.portfolio_value || 0);
    const currValue = Number(current.portfolio_value || 0);
    return prevValue > 0 ? ((currValue - prevValue) / prevValue) * 100 : 0;
  });

  const mean = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, val) => sum + (val - mean) ** 2, 0) / dailyReturns.length;
  return Math.sqrt(variance);
};
