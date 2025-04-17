import {
  Y_DOMAIN_MIN_PERCENT_PADDING,
  Y_DOMAIN_PADDING_PERCENT,
} from "./constants";
import type { ChartDataPoint, ChartDataKey } from "./types";

export function formatYAxis(
  value: number,
  type: "absolute" | "percentual",
): string {
  return type === "absolute"
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `${value.toFixed(0)}%`;
}

export function calculateYDomain(
  data: ChartDataPoint[],
  type: "absolute" | "percentual",
): [number, number] {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return type === "absolute" ? [0, 100] : [-10, 10];
  }

  // Define keys to extract based on chart type
  const keys: ChartDataKey[] =
    type === "absolute" ? ["totalPortfolio"] : ["portfolio", "indexFund"];

  // Extract all valid numeric values from specified keys
  const values = data
    .flatMap((point) => keys.map((key) => point[key]))
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );

  // Handle insufficient data
  if (values.length === 0) {
    return type === "absolute" ? [0, 100] : [-10, 10];
  }

  // Calculate min and max
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (type === "percentual") {
    // For percentual, make domain symmetric around 0
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    if (absMax === 0) {
      return [-Y_DOMAIN_MIN_PERCENT_PADDING, Y_DOMAIN_MIN_PERCENT_PADDING];
    }

    const padding = Math.max(
      absMax * Y_DOMAIN_PADDING_PERCENT,
      Y_DOMAIN_MIN_PERCENT_PADDING,
    );
    return [-(absMax + padding), absMax + padding];
  }

  // Absolute case: Use actual min/max with padding
  if (min === max) {
    const padding = Y_DOMAIN_MIN_PERCENT_PADDING;
    return [min - padding, max + padding];
  }

  const range = max - min;
  const padding = Math.max(
    range * Y_DOMAIN_PADDING_PERCENT,
    Y_DOMAIN_MIN_PERCENT_PADDING,
  );

  return [min - padding, max + padding];
}
