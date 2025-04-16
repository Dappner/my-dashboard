import type { Database } from "@my-dashboard/shared";

export type SupportedCurrency = Database["grocery"]["Enums"]["currency_type"];

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
};

/**
 * Format a number as currency with the given currency code
 */
export function formatCurrencyValue(
  value: number,
  currencyCode: SupportedCurrency = "USD",
  options: {
    compact?: boolean;
    decimals?: number;
    showSymbol?: boolean;
  } = {},
): string {
  const { compact = false, decimals = 2, showSymbol = true } = options;
  const symbol = showSymbol ? CURRENCY_SYMBOLS[currencyCode] : "";

  // Use compact notation for large numbers
  if (compact) {
    if (Math.abs(value) >= 1e9) {
      return `${symbol}${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `${symbol}${(value / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `${symbol}${(value / 1e3).toFixed(1)}K`;
    }
  }

  // Use full notation
  return new Intl.NumberFormat("en-US", {
    style: showSymbol ? "currency" : "decimal",
    currency: currencyCode,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(
  currencyCode: SupportedCurrency = "USD",
): string {
  return CURRENCY_SYMBOLS[currencyCode] || "$";
}

/**
 * Get a list of supported currencies with their symbols and codes
 */
export function getSupportedCurrencies() {
  return Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
    code: code as SupportedCurrency,
    symbol,
    label: getCurrencyLabel(code as SupportedCurrency),
  }));
}

/**
 * Get human-readable label for currency code
 */
export function getCurrencyLabel(currencyCode: SupportedCurrency): string {
  const labels: Record<SupportedCurrency, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CNY: "Chinese Yuan",
  };

  return labels[currencyCode] || currencyCode;
}
