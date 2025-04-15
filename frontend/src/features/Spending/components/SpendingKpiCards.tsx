import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { Receipt as ReceiptIcon, TrendingUp } from "lucide-react";
import { SpendingTrendIndicator } from "./SpendingTrendIndicator";
import { useMonthParam } from "@/hooks/useMonthParam";
import { useAverageDailySpend } from "../hooks/useAverageDailySpend";
import { useSpendingMetrics } from "../hooks/useSpendingMetrics";
import { useDailySpending } from "../hooks/useDailySpending";

export const SpendingKpiCards: React.FC = () => {
  const { selectedDate } = useMonthParam();
  const { spendingMetrics, isLoading: spendingMetricsLoading } =
    useSpendingMetrics(selectedDate);
  const { data: dailySpending, isLoading: isDailySpendingLoading } =
    useDailySpending({ selectedDate });

  const averageDailySpend = useAverageDailySpend({
    dailySpending,
    selectedDate,
  });

  const isLoading = spendingMetricsLoading || isDailySpendingLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const topCategory = spendingMetrics?.categories.reduce(
    (max, category) => (category.amount > max.amount ? category : max),
    spendingMetrics.categories[0] || { id: "", name: "None", amount: 0 },
  );

  return (
    <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${spendingMetrics?.totalSpent.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ReceiptIcon className="h-4 w-4 mr-2" />
            Receipts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {spendingMetrics?.receiptCount}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-lg">Top Category</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategory?.id ? (
            <>
              <Link
                className="text-xl font-bold hover:underline"
                to={spendingCategoryDetailRoute.to}
                params={{ categoryId: topCategory.id }}
                search={(prev) => ({ ...prev })}
              >
                {topCategory.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                ${topCategory.amount.toFixed(2)}
              </p>
            </>
          ) : (
            <div className="text-xl font-bold text-muted-foreground">
              No categories
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Daily Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${averageDailySpend.toFixed(2)}
          </div>
          <SpendingTrendIndicator trend={spendingMetrics?.monthlyTrend || 0} />
        </CardContent>
      </Card>
    </div>
  );
};
