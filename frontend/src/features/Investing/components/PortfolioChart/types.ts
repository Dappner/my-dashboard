export interface ChartDataPoint {
  date: Date;
  portfolio?: number;
  indexFund?: number;
  totalPortfolio?: number;
}

export type ChartDataKey = "totalPortfolio" | "portfolio" | "indexFund";
