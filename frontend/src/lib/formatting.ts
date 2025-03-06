export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "TBD";
  const currentDate = new Date();
  const newDate = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions =
    currentDate.getFullYear() !== newDate.getFullYear()
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", options);
};

export const formatLargeNumber = (number?: number | null): string => {
  if (!number) return "N/A";
  if (number >= 1e12) return `$${(number / 1e12).toFixed(2)}T`;
  if (number >= 1e9) return `$${(number / 1e9).toFixed(2)}B`;
  if (number >= 1e6) return `$${(number / 1e6).toFixed(2)}M`;
  return `$${number.toLocaleString()}`;
};

export const formatPercent = (value?: number | null): string => {
  if (!value) return "N/A";

  return `${value.toFixed(2)}%`;
}

