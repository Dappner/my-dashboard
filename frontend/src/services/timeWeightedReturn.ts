
/**
 * Calculates the Time-Weighted Return (TWR) of a portfolio.
 *
 * The TWR isolates the portfolio manager's skill by removing the impact of
 * cash inflows and outflows. It is calculated by dividing the time period
 * into sub-periods based on cash flows.
 *
 * Formula:
 * TWR = [(1 + HP1) * (1 + HP2) * ... * (1 + HPn)] - 1
 *
 * Where:
 * HPi = (End Value - Start Value - Cash Flow) / Start Value
 *
 * @param periods An array of objects representing the portfolio's value and
 * cash flows over time.  Each object must have `startValue`, `endValue`, and
 * `cashFlow` properties.
 * @returns The TWR as a percentage.
 */
export const calculateTimeWeightedReturn = (
  periods: { startValue: number; endValue: number; cashFlow: number }[]
): number => {
  let product = 1;
  for (const period of periods) {
    const { startValue, endValue, cashFlow } = period;
    if (startValue === 0) {
      continue; // Skip periods with zero start value to avoid division by zero.
    }
    const periodReturn = (endValue - startValue - cashFlow) / startValue;
    product *= 1 + periodReturn;
  }

  return (product - 1) * 100;
};
