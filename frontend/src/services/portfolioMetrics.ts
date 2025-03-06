import { PortfolioDailyMetric, Timeframe } from "@/types/portfolioDailyMetricTypes";
import { TradeView } from "@/types/transactionsTypes"; // Assuming this is the type for transactions

interface PortfolioMetrics {
  totalPortfolioValue: number;
  investmentValue: number;
  cashBalance: number;
  timeframeChange: number;
  timeframeChangePercent: number;
  timeframeReturn: number;
  timeframeReturnPercent: number;
  cashPercentage: number;
  investmentGrowth: number;
  investmentGrowthPercent: number;
  volatility: number;
  ytdDividends?: number; // New KPI
  dividendYield?: number; // New KPI
}

export const calculatePortfolioMetrics = (
  dailyMetrics: PortfolioDailyMetric[],
  timeframe: Timeframe,
  transactions?: TradeView[], // Optional transactions for dividends
  holdings?: any[] // Optional holdings for dividend yield
): PortfolioMetrics => {
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
    timeframeReturn = investmentValue - portfolioCostBasis;
    timeframeReturnPercent = portfolioCostBasis > 0
      ? (timeframeReturn / portfolioCostBasis) * 100
      : 0;
  } else {
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

  // Volatility
  const volatility = calculateVolatility(dailyMetrics);

  // YTD Dividends (requires transactions)
  const currentYear = new Date().getFullYear();
  const ytdDividends = transactions
    ?.filter((t) => t.transaction_type === "dividend" && new Date(t.transaction_date!).getFullYear() === currentYear)
    ?.reduce((sum, t) => sum + (t.gross_transaction_amount || 0), 0) || 0;

  // Dividend Yield (portfolio-wide average, requires holdings)
  const dividendYield = holdings?.length
    ? holdings.reduce((sum, h) => sum + (h.market_dividend_yield_percent || 0), 0) / holdings.length
    : 0;

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
    ytdDividends,
    dividendYield,
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
