/**
 * Calculates the Sharpe Ratio, a measure of risk-adjusted return.
 *
 * $$ Sharpe Ratio = \frac{(Portfolio Return - Risk-Free Rate)}{Portfolio Standard Deviation} $$
 *
 * @param portfolioReturn The portfolio's return over a period (e.g., annual).
 * @param riskFreeRate The risk-free rate of return over the same period.
 * @param portfolioStdDev The standard deviation of the portfolio's returns.
 * @returns The Sharpe Ratio.
 */
export const calculateSharpeRatio = (
  portfolioReturn: number,
  riskFreeRate: number,
  portfolioStdDev: number,
): number => {
  if (portfolioStdDev === 0) {
    return 0; // Or Infinity, depending on the desired behavior
  }
  return (portfolioReturn - riskFreeRate) / portfolioStdDev;
};

/**
 * Calculates the Sortino Ratio, a variation of the Sharpe Ratio that only
 * penalizes downside risk.
 *
 * $$ Sortino Ratio = \frac{(Portfolio Return - Risk-Free Rate)}{Downside Standard Deviation} $$
 *
 * @param portfolioReturn The portfolio's return over a period.
 * @param riskFreeRate The risk-free rate of return over the same period.
 * @param downsideStdDev The downside standard deviation of the portfolio's returns.
 * @returns The Sortino Ratio.
 */
export const calculateSortinoRatio = (
  portfolioReturn: number,
  riskFreeRate: number,
  downsideStdDev: number,
): number => {
  if (downsideStdDev === 0) {
    return 0; // Or Infinity, depending on the desired behavior
  }
  return (portfolioReturn - riskFreeRate) / downsideStdDev;
};

/**
 * Calculates the maximum drawdown, which is the largest peak-to-trough decline
 * during a specified period.
 *
 * @param values An array of portfolio values over time.
 * @returns The maximum drawdown as a percentage.
 */
export const calculateMaxDrawdown = (values: number[]): number => {
  let peak = values[0];
  let maxDrawdown = 0;

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown * 100;
};
