import { Holding } from "@/types/holdingsTypes";
import { monthsShort } from "./constants";

export const prepareSectorData = (holdings: Holding[]) => {
  if (!holdings || holdings.length === 0) return [];

  // Group by sector and calculate total value
  const sectorMap = new Map<string, number>();

  holdings.forEach(holding => {
    const sector = holding.sector || "Unknown";
    const value = (holding.shares || 0) * (holding.average_cost_basis || 0);

    if (sectorMap.has(sector)) {
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
    } else {
      sectorMap.set(sector, value);
    }
  });

  // Convert to array for the pie chart
  return Array.from(sectorMap.entries())
    .map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2))
    }))
    .sort((a, b) => b.value - a.value); // Sort by descending value
};

// Process data for the industry allocation pie chart
export const prepareIndustryData = (holdings: Holding[]) => {
  if (!holdings || holdings.length === 0) return [];

  // Group by industry and calculate total value
  const industryMap = new Map<string, number>();

  holdings.forEach(holding => {
    const industry = holding.industry || "Unknown";
    const value = (holding.shares || 0) * (holding.average_cost_basis || 0);

    if (industryMap.has(industry)) {
      industryMap.set(industry, (industryMap.get(industry) || 0) + value);
    } else {
      industryMap.set(industry, value);
    }
  });

  // Convert to array for the pie chart
  return Array.from(industryMap.entries())
    .map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2))
    }))
    .sort((a, b) => b.value - a.value);
};

// DIVIDEND UTILS
/**
 * Calculates total annual dividend income from all holdings
 * @param {Array} holdings - Array of holding objects
 * @returns {Number} - Total annual dividend income
 */
export function calculateTotalAnnualDividend(holdings: Holding[]): number {
  if (!holdings || holdings.length === 0) return 0;

  return holdings.reduce((total, holding) => {
    return total + (holding.annual_dividend_amount || 0);
  }, 0);
}

/**
 * Calculates average dividend yield across all holdings (weighted by position value)
 * @param {Array} holdings - Array of holding objects
 * @returns {Number} - Weighted average yield percentage
 */
export function calculateAverageYield(holdings: Holding[]): number {
  if (!holdings || holdings.length === 0) return 0;

  let totalValue = 0;
  let weightedYieldSum = 0;

  holdings.forEach(holding => {
    const positionValue = (holding.average_cost_basis || 0) * (holding.shares || 0);
    totalValue += positionValue;
    weightedYieldSum += (holding.cost_basis_dividend_yield_percent || 0) * positionValue;
  });

  return totalValue > 0 ? weightedYieldSum / totalValue : 0;
}

/**
 * Calculates monthly average dividend income
 * @param {Array} holdings - Array of holding objects
 * @returns {Number} - Average monthly income
 */
export function calculateMonthlyAverage(holdings: Holding[]): number {
  const annualTotal = calculateTotalAnnualDividend(holdings);
  return annualTotal / 12;
}

interface NextDividendInfo {
  symbol: string;
  month: string;
  date: Date;
  displayDate: string;
}

/**
 * Finds the next upcoming dividend payment
 * @param {Array} holdings - Array of holding objects
 * @returns {Object|null} - Next dividend payment info or null
 */
export function findNextDividendPayment(holdings: Holding[]): NextDividendInfo | null {
  if (!holdings || holdings.length === 0) return null;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let nextDividendInfo: NextDividendInfo | null = null;
  let closestMonthDiff = 13; // More than maximum possible

  holdings.forEach(holding => {
    if (!holding.dividend_months || holding.dividend_months.length === 0) return;

    holding.dividend_months.forEach(monthNum => {
      // Normalize month index to 0-based
      const month = monthNum > 11 ? 0 : monthNum;

      // Calculate months from now (handling year boundary)
      let monthsFromNow = month - currentMonth;
      if (monthsFromNow <= 0) monthsFromNow += 12;

      // Found a closer dividend
      if (monthsFromNow < closestMonthDiff) {
        closestMonthDiff = monthsFromNow;

        // For display, we'll use 15th as an approximate day if actual day is unknown
        const nextDate = new Date(
          month < currentMonth ? currentYear + 1 : currentYear,
          month,
          15
        );

        nextDividendInfo = {
          symbol: holding.symbol || "Unknown",
          month: monthsShort[month],
          date: nextDate,
          displayDate: `${monthsShort[month]} ${nextDate.getDate()}, ${nextDate.getFullYear()}`
        };
      }
    });
  });

  return nextDividendInfo;
}

/**
 * Sorts holdings by a specific property
 * @param {Array} holdings - Array of holding objects
 * @param {String} property - Property to sort by
 * @param {Boolean} desc - Sort descending if true
 * @returns {Array} - Sorted holdings array
 */
export function sortHoldingsByProperty<T extends keyof Holding>(
  holdings: Holding[] | undefined,
  property: T,
  desc = true
): Holding[] {
  if (!holdings) return [];

  return [...holdings].sort((a, b) => {
    const valueA = (a[property] as number) || 0;
    const valueB = (b[property] as number) || 0;

    return desc ? valueB - valueA : valueA - valueB;
  });
}

export const prepareDividendChartData = (holdings?: Holding[]) => {
  if (!holdings || holdings.length === 0) return [];

  // Initialize monthly data
  const monthlyData = monthsShort.map((month, index) => ({
    name: month,
    month: index,
    total: 0
  }));

  // Calculate dividend amount per month for each holding
  holdings.forEach(holding => {
    const {
      symbol,
      dividend_amount,
      dividend_months,
      shares
    } = holding;

    if (dividend_amount && dividend_months && shares) {
      const monthlyDividend = dividend_amount * shares;

      dividend_months.forEach((monthIndex: number) => {
        // Need to ensure monthIndex is valid
        if (monthIndex >= 0 && monthIndex < monthsShort.length) {
          // Add this holding's dividend to the month
          // Need to use indexing with bracket notation since we're adding dynamic property
          const symbolKey = symbol as string;
          (monthlyData[monthIndex] as any)[symbolKey] =
            ((monthlyData[monthIndex] as any)[symbolKey] || 0) + monthlyDividend;

          // Update total for the month
          monthlyData[monthIndex].total += monthlyDividend;
        }
      });
    }
  });

  return monthlyData;
};
