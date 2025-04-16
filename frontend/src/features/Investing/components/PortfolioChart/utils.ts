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
    ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : `${value.toFixed(0)}%`;
}

export function calculateYDomain(
  data: ChartDataPoint[],
  visibleLines: Record<ChartDataKey, boolean>,
  type: "absolute" | "percentual",
): [number | string, number | string] {
  if (!data || data.length === 0) {
    return ["auto", "auto"];
  }

  const getValues = (key: ChartDataKey): number[] =>
    visibleLines[key]
      ? data
        .map((d) => d[key])
        .filter(
          (v): v is number => typeof v === "number" && Number.isFinite(v),
        )
      : [];

  if (type === "percentual") {
    const values = [
      ...getValues("portfolio"),
      ...getValues("indexFund"),
      0,
    ].filter(Number.isFinite);

    if (values.length <= 1) {
      return [-10, 10];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) {
      return [
        min - Y_DOMAIN_MIN_PERCENT_PADDING,
        max + Y_DOMAIN_MIN_PERCENT_PADDING,
      ];
    }

    const padding = Math.max(
      (max - min) * Y_DOMAIN_PADDING_PERCENT,
      Y_DOMAIN_MIN_PERCENT_PADDING,
    );
    return [min - padding, max + padding];
  }

  // Absolute
  const values = [...getValues("totalPortfolio"), 0].filter(Number.isFinite);

  if (values.length <= 1) {
    return [0, 100];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(
    (max - min) * Y_DOMAIN_PADDING_PERCENT,
    Y_DOMAIN_MIN_PERCENT_PADDING,
  );
  const minY = min < 0 ? min - padding : 0;
  const maxY = max + padding;

  return [minY, maxY];
}
