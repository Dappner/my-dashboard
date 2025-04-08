import { Holding } from "@/api/modules/holdings/types";
import { PortfolioDailyMetric } from "@/api/modules/portfolioDailyMetrics/types";
import { TradeView } from "@/api/modules/transactions/types";
import { Timeframe } from "@/utils";

// Define interface with JSDoc documentation
export interface PortfolioMetrics {
  /** Current total portfolio value (investments + cash) in USD */
  currentTotalValue: number;
  /** Current market value of all investments in USD */
  currentInvestmentValue: number;
  /** Current available cash balance in USD */
  currentCashBalance: number;
  /** Percentage of portfolio held in cash */
  currentCashPercentage: number;
  /** Original cost basis of all investments in USD */
  currentCostBasis: number;
  /** Current unrealized profit/loss in USD */
  currentUnrealizedPL: number;

  /** Dollar change in total portfolio value for the period */
  periodTotalChange: number;
  /** Percentage change in total portfolio value for the period */
  periodTotalChangePercent: number;
  /** Dollar change in investment value (price appreciation only) */
  periodInvestmentChange: number;
  /** Percentage change in investment value (price appreciation only) */
  periodInvestmentChangePercent: number;
  /** Unrealized profit/loss for the period in USD */
  periodUnrealizedPL: number;

  /** Total return including dividends for the period in USD */
  periodTotalReturn: number;
  /** Total return percentage including dividends for the period */
  periodTotalReturnPercent: number;
  /** Total dividends received during the period in USD */
  periodDividendsReceived: number;

  /** Annualized volatility (standard deviation of daily returns) */
  volatility: number;
  /** Dividends received in current year in USD */
  currentYearDividends?: number;
  /** Current annualized dividend yield percentage */
  currentDividendYield?: number;

  // Additional metrics
  /** Highest portfolio value during the period */
  periodHighValue?: number;
  /** Lowest portfolio value during the period */
  periodLowValue?: number;
  /** Number of transactions in the period */
  transactionCount?: number;
}

/**
 * Calculates comprehensive portfolio metrics based on daily data and transactions
 * @param dailyMetrics Array of daily portfolio metrics
 * @param timeframe Selected timeframe for analysis
 * @param transactions Optional array of portfolio transactions
 * @param holdings Optional array of current holdings
 * @returns PortfolioMetrics object containing calculated metrics
 * @throws Error if critical data is invalid
 */
export const calculatePortfolioMetrics = (
  dailyMetrics: PortfolioDailyMetric[],
  timeframe: Timeframe,
  transactions: TradeView[] = [],
  holdings: Holding[] = [],
): PortfolioMetrics => {
  // Input validation
  if (!Array.isArray(dailyMetrics)) {
    throw new Error("Daily metrics must be an array");
  }

  if (!dailyMetrics.length) {
    return getEmptyMetrics();
  }

  try {
    // Get start and end data points
    const currentMetrics = dailyMetrics[dailyMetrics.length - 1];
    const periodStartMetrics = dailyMetrics[0];

    // Validate dates
    const startDate = new Date(periodStartMetrics.current_date || "");
    const endDate = new Date(currentMetrics.current_date || "");
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid date in metrics data");
    }

    // Current portfolio state calculations
    const currentTotalValue = Number(currentMetrics.total_portfolio_value) || 0;
    const currentInvestmentValue = Number(currentMetrics.portfolio_value) || 0;
    const currentCashBalance = Number(currentMetrics.cash_balance) || 0;
    const currentCostBasis = Number(currentMetrics.cost_basis) || 0;
    const currentCashPercentage = currentTotalValue > 0
      ? (currentCashBalance / currentTotalValue) * 100
      : 0;
    const currentUnrealizedPL = currentInvestmentValue - currentCostBasis;

    // Previous period values
    const previousTotalValue =
      Number(periodStartMetrics.total_portfolio_value) || currentTotalValue;
    const previousInvestmentValue =
      Number(periodStartMetrics.portfolio_value) || currentInvestmentValue;
    const previousCostBasis = Number(periodStartMetrics.cost_basis) ||
      currentCostBasis;
    const previousUnrealizedPL = previousInvestmentValue - previousCostBasis;

    // Period performance calculations
    const periodTotalChange = currentTotalValue - previousTotalValue;
    const periodTotalChangePercent = safePercentage(
      periodTotalChange,
      previousTotalValue,
    );
    const periodInvestmentChange = currentInvestmentValue -
      previousInvestmentValue;
    const periodInvestmentChangePercent = safePercentage(
      periodInvestmentChange,
      previousInvestmentValue,
    );

    // Additional period metrics
    const periodValues = dailyMetrics.map(
      (m) => Number(m.total_portfolio_value) || 0,
    );
    const periodHighValue = Math.max(...periodValues);
    const periodLowValue = Math.min(...periodValues);

    // Dividend and return calculations
    const periodDividendsReceived = calculatePeriodDividends(
      transactions,
      startDate,
      endDate,
    );
    const transactionCount = calculateTransactionCount(
      transactions,
      startDate,
      endDate,
    );

    let periodTotalReturn: number;
    let periodTotalReturnPercent: number;
    let periodUnrealizedPL: number;

    if (timeframe === "ALL") {
      periodTotalReturn = currentInvestmentValue - currentCostBasis +
        periodDividendsReceived;
      periodTotalReturnPercent = safePercentage(
        periodTotalReturn,
        currentCostBasis,
      );
      periodUnrealizedPL = currentUnrealizedPL;
    } else {
      periodTotalReturn = periodInvestmentChange + periodDividendsReceived;
      periodTotalReturnPercent = safePercentage(
        periodTotalReturn,
        previousInvestmentValue,
      );
      periodUnrealizedPL = currentUnrealizedPL - previousUnrealizedPL;
    }

    // Risk and income metrics
    const volatility = calculateVolatility(dailyMetrics);
    const currentYearDividends = calculateYearToDateDividends(transactions);
    const currentDividendYield = calculatePortfolioDividendYield(holdings);

    return {
      currentTotalValue,
      currentInvestmentValue,
      currentCashBalance,
      currentCashPercentage,
      currentCostBasis,
      currentUnrealizedPL,
      periodTotalChange,
      periodTotalChangePercent,
      periodInvestmentChange,
      periodInvestmentChangePercent,
      periodUnrealizedPL,
      periodTotalReturn,
      periodTotalReturnPercent,
      periodDividendsReceived,
      volatility,
      currentYearDividends,
      currentDividendYield,
      periodHighValue,
      periodLowValue,
      transactionCount,
    };
  } catch (error) {
    console.error("Error calculating portfolio metrics:", error);
    return getEmptyMetrics();
  }
};

/**
 * Safely calculates percentage change avoiding division by zero
 * @param change Change amount
 * @param base Base amount
 * @returns Percentage change
 */
const safePercentage = (change: number, base: number): number =>
  base > 0 ? (change / base) * 100 : 0;

/**
 * Calculates total dividends received in a period
 * @param transactions Array of transactions
 * @param startDate Start of period
 * @param endDate End of period
 * @returns Total dividends in USD
 */
const calculatePeriodDividends = (
  transactions: TradeView[],
  startDate: Date,
  endDate: Date,
): number => {
  if (!transactions.length || !startDate || !endDate) return 0;

  return transactions
    .filter((t) => {
      const txDate = new Date(t.transaction_date || "");
      return (
        t.transaction_type === "dividend" &&
        !Number.isNaN(txDate.getTime()) &&
        txDate >= startDate &&
        txDate <= endDate
      );
    })
    .reduce((sum, t) => sum + (Number(t.gross_transaction_amount) || 0), 0);
};

/**
 * Calculates number of transactions in a period
 * @param transactions Array of transactions
 * @param startDate Start of period
 * @param endDate End of period
 * @returns Number of transactions
 */
const calculateTransactionCount = (
  transactions: TradeView[],
  startDate: Date,
  endDate: Date,
): number => {
  if (!transactions.length || !startDate || !endDate) return 0;

  return transactions.filter((t) => {
    const txDate = new Date(t.transaction_date || "");
    return (
      !Number.isNaN(txDate.getTime()) &&
      txDate >= startDate &&
      txDate <= endDate
    );
  }).length;
};

/**
 * Calculates year-to-date dividends
 * @param transactions Array of transactions
 * @returns Total YTD dividends in USD
 */
const calculateYearToDateDividends = (transactions: TradeView[]): number => {
  if (!transactions.length) return 0;

  const currentYear = new Date().getFullYear();
  return transactions
    .filter((t) => {
      const txDate = new Date(t.transaction_date || "");
      return (
        t.transaction_type === "dividend" &&
        !Number.isNaN(txDate.getTime()) &&
        txDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + (Number(t.gross_transaction_amount) || 0), 0);
};

/**
 * Calculates weighted average dividend yield of portfolio
 * @param holdings Array of current holdings
 * @returns Average dividend yield percentage
 */
const calculatePortfolioDividendYield = (holdings: Holding[]): number => {
  if (!holdings.length) return 0;

  const totalValue = holdings.reduce(
    (sum, h) => sum + (Number(h.current_market_value) || 0),
    0,
  );

  if (totalValue === 0) return 0;

  return holdings.reduce((sum, holding) => {
    const weight = (Number(holding.current_market_value) || 0) / totalValue;
    const yieldPercent = Number(holding.market_dividend_yield_percent) || 0;
    return sum + yieldPercent * weight;
  }, 0);
};

/**
 * Calculates annualized volatility using daily returns
 * @param metrics Array of daily portfolio metrics
 * @returns Annualized standard deviation of returns
 */
const calculateVolatility = (metrics: PortfolioDailyMetric[]): number => {
  if (metrics.length < 2) return 0;

  const dailyReturns = metrics.slice(1).map((current, index) => {
    const previous = metrics[index];
    const prevValue = Number(previous.portfolio_value) || 0;
    const currValue = Number(current.portfolio_value) || 0;
    return safePercentage(currValue - prevValue, prevValue);
  });

  const mean = dailyReturns.reduce((sum, val) => sum + val, 0) /
    dailyReturns.length;
  const variance =
    dailyReturns.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
    dailyReturns.length;

  // Annualize volatility (assuming 252 trading days)
  return Math.sqrt(variance) * Math.sqrt(252);
};

/**
 * Returns default empty metrics object
 * @returns PortfolioMetrics with all values initialized to zero
 */
const getEmptyMetrics = (): PortfolioMetrics => ({
  currentTotalValue: 0,
  currentInvestmentValue: 0,
  currentCashBalance: 0,
  currentCashPercentage: 0,
  currentCostBasis: 0,
  currentUnrealizedPL: 0,
  periodTotalChange: 0,
  periodTotalChangePercent: 0,
  periodInvestmentChange: 0,
  periodInvestmentChangePercent: 0,
  periodUnrealizedPL: 0,
  periodTotalReturn: 0,
  periodTotalReturnPercent: 0,
  periodDividendsReceived: 0,
  volatility: 0,
  currentYearDividends: 0,
  currentDividendYield: 0,
  periodHighValue: 0,
  periodLowValue: 0,
  transactionCount: 0,
});
