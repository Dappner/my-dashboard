export type Timeframe =
  // Calendar periods (using clear but short identifiers)
  | "w" | "m" | "q" | "y" | "all" | "custom"
  // Rolling periods (with 'r' prefix for "rolling")
  | "r1w" | "r1m" | "r3m" | "r1y"
  // Legacy timeframes (preserved for backward compatibility)
  | "1W" | "1M" | "3M" | "YTD" | "1Y" | "ALL";

export const timeframeLabels: Record<Timeframe, string> = {
  // Calendar periods
  "w": "Week",
  "m": "Month",
  "q": "Quarter",
  "y": "Year",
  "all": "All",
  "custom": "Custom",

  // Rolling periods
  "r1w": "7d",
  "r1m": "30d",
  "r3m": "90d",
  "r1y": "1y",

  // Legacy timeframes
  "1W": "Week",
  "1M": "Month",
  "3M": "Quarter",
  "YTD": "YTD",
  "1Y": "Year",
  "ALL": "All",
};

export interface DateRange {
  startDate: string | null;
  endDate?: string;
}

export function convertTimeframeToDateRange(timeframe: Timeframe): DateRange {
  const now = new Date();

  switch (timeframe) {
    case "1W": {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      return { startDate: oneWeekAgo };
    }
    case "1M": {
      const oneMonthAgo = new Date(
        now.setMonth(now.getMonth() - 1),
      ).toISOString();
      return { startDate: oneMonthAgo };
    }
    case "3M": {
      const threeMonthsAgo = new Date(
        now.setMonth(now.getMonth() - 3),
      ).toISOString();
      return { startDate: threeMonthsAgo };
    }
    case "YTD": {
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
      return { startDate: yearStart };
    }
    case "1Y": {
      const oneYearAgo = new Date(
        now.setFullYear(now.getFullYear() - 1),
      ).toISOString();
      return { startDate: oneYearAgo };
    }
    case "ALL":
      return { startDate: null };
    default:
      throw new Error(`Unsupported timeframe: ${timeframe}`);
  }
}
