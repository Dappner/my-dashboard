import { format, isValid } from "date-fns";
import type { TooltipProps } from "recharts";

type ChartDataKey = "totalPortfolio" | "portfolio" | "indexFund";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  chartType: "absolute" | "percentual";
  chartConfig: ChartConfig;
}

export const CustomPortfolioTooltip = ({
  active,
  payload,
  chartType,
  chartConfig,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  // Extract date from payload
  const dateFromPayload = payload[0].payload?.date;
  const date =
    dateFromPayload instanceof Date && isValid(dateFromPayload)
      ? format(dateFromPayload, "MMM d, yyyy")
      : null;

  return (
    <div className="bg-background/90 backdrop-blur-sm shadow-lg rounded-md p-2 border border-border/70">
      {date && <div className="text-sm font-semibold mb-1 px-2">{date}</div>}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          if (
            typeof entry.value !== "number" ||
            !Number.isFinite(entry.value) ||
            !entry.dataKey ||
            !(entry.dataKey in chartConfig)
          ) {
            return null;
          }

          const key = entry.dataKey as ChartDataKey;

          // Only show relevant lines based on chart type
          if (chartType === "absolute" && key !== "totalPortfolio") {
            return null;
          }
          if (
            chartType === "percentual" &&
            key !== "portfolio" &&
            key !== "indexFund"
          ) {
            return null;
          }

          const config = chartConfig[key];
          const formattedValue =
            chartType === "absolute"
              ? `$${entry.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
              : `${entry.value.toFixed(2)}%`;

          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Fine for now
              key={`tooltip-${index}`}
              className="flex items-center gap-2 px-2"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: config.color }}
              />
              <div className="flex flex-1 justify-between leading-none">
                <span className="text-muted-foreground">{config.label}</span>
                <span className="font-bold ml-4">{formattedValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
