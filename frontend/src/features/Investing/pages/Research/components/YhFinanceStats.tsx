import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLargeNumber } from "@/lib/formatting";
import type { YahooFinanceDaily } from "@/types/yahooFinanceDaily";
import { format } from "date-fns";

interface YhFinanceStatsProps {
  yahooFinanceDaily?: YahooFinanceDaily | null;
  isLoading: boolean;
}

export default function YhFinanceStats({
  yahooFinanceDaily,
  isLoading,
}: YhFinanceStatsProps) {
  const statsConfig = [
    {
      label: "52-Week Low",
      value: yahooFinanceDaily?.fifty_two_week_low?.toFixed(2),
      prefix: "$",
    },
    {
      label: "52-Week High",
      value: yahooFinanceDaily?.fifty_two_week_high?.toFixed(2),
      prefix: "$",
    },
    {
      label: "Div Yield",
      value: yahooFinanceDaily?.dividend_yield?.toFixed(2),
      suffix: "%",
    },
    {
      label: "50-Day Avg",
      value: yahooFinanceDaily?.fifty_day_average?.toFixed(2),
      prefix: "$",
    },
    {
      label: "200-Day Avg",
      value: yahooFinanceDaily?.two_hundred_day_average?.toFixed(2),
      prefix: "$",
    },
    {
      label: "NAV Price",
      value: yahooFinanceDaily?.nav_price?.toFixed(2),
      prefix: "$",
    },
    {
      label: "Trailing P/E",
      value: yahooFinanceDaily?.trailing_pe?.toFixed(2),
    },
    {
      label: "Total Assets",
      value: formatLargeNumber(yahooFinanceDaily?.total_assets),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 h-auto md:h-8">
        <h2 className="text-lg font-semibold text-gray-900">
          YH Finance Stats
        </h2>
        {isLoading
          ? <Skeleton className="h-5 w-24 mt-2 md:mt-0" />
          : (
            <h2 className="text-base font-semibold text-gray-500 mt-1 md:mt-0">
              {yahooFinanceDaily?.date
                ? format(
                  new Date(`${yahooFinanceDaily.date}T00:00:00`),
                  "MM/dd/yyyy",
                )
                : "N/A"}
            </h2>
          )}
      </div>
      <Card>
        <CardContent className="py-4 grid grid-cols-1 gap-2 ">
          {isLoading
            ? (
              <div className="space-y-3">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: Loading State
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
              </div>
            )
            : (
              statsConfig.map((stat, index) => (
                <div key={`${index}-${stat}`} className="flex justify-between">
                  <span className="text-sm">{stat.label}</span>
                  <span className="font-medium">
                    {stat.prefix || ""}
                    {stat.value || "N/A"}
                    {stat.suffix || ""}
                  </span>
                </div>
              ))
            )}
        </CardContent>
      </Card>
    </>
  );
}
