import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useMonthParam } from "@/hooks/useMonthParam";
import { RefreshCwIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { MonthSwitcher } from "../../components/MonthSwitcher";
import { CATEGORY_COLORS } from "../../constants";
import {
  useCurrentMonthSpending,
  useSpendingCategories,
} from "../../hooks/spendingMetricsHooks";
import { CategoryCard } from "./components/CategoryCard";

export function SpendingCategoriesPage() {
  const { selectedDate, setSelectedDate } = useMonthParam();
  const { convertAmount, displayCurrency } = useCurrencyConversion();

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useSpendingCategories(selectedDate);

  const {
    data: currentMonthData,
    isLoading: currentMonthLoading,
    error: currentMonthError,
    refetch: refetchCurrentMonth,
    isRefetching: isRefetchingCurrentMonth,
  } = useCurrentMonthSpending(selectedDate);

  const isLoading = categoriesLoading || currentMonthLoading;
  const isRefetching = isRefetchingCategories || isRefetchingCurrentMonth;
  const hasError = categoriesError || currentMonthError;

  // Calculate total spent across all categories (converted to user's currency)
  const totalSpent = currentMonthData?.totalSpent || 0;

  // Process and consolidate categories with the same name
  const consolidatedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    // Create a map to consolidate categories with the same name
    const categoryMap = new Map();

    // biome-ignore lint/complexity/noForEach: Fine
    categories.forEach((category) => {
      const convertedAmount = convertAmount(category.amount, category.currency);

      if (categoryMap.has(category.name)) {
        // Add amount to existing category
        const existing = categoryMap.get(category.name);
        existing.amount += convertedAmount;
      } else {
        // Create new category entry with converted amount
        categoryMap.set(category.name, {
          id: category.id,
          name: category.name,
          amount: convertedAmount,
          currency: displayCurrency,
          originalData: [category],
        });
      }
    });

    // Convert map to array and sort by amount
    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  }, [categories, convertAmount, displayCurrency]);

  // Process categories for pie chart: group small categories into "Other" if > 8
  const processedCategories = useMemo(() => {
    if (consolidatedCategories.length === 0) return [];

    if (consolidatedCategories.length > 8) {
      const topCategories = consolidatedCategories.slice(0, 7);
      const otherCategories = consolidatedCategories.slice(7);

      const otherTotal = otherCategories.reduce(
        (sum, cat) => sum + cat.amount,
        0,
      );

      return [
        ...topCategories,
        {
          id: "other",
          name: "Other",
          amount: otherTotal,
          currency: displayCurrency,
        },
      ];
    }

    return consolidatedCategories;
  }, [consolidatedCategories, displayCurrency]);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-2 shadow-md z-50 flex flex-col overflow-hidden">
          <span className="text-base font-semibold">{data.name}</span>
          <CurrencyDisplay amount={data.amount} />
        </div>
      );
    }
    return null;
  };

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refetchCategories();
    refetchCurrentMonth();
  }, [refetchCategories, refetchCurrentMonth]);

  return (
    <PageContainer>
      <header className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <MonthSwitcher
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="w-full sm:w-auto"
          />
          {(isRefetching || hasError) && (
            <Button
              size="icon"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCwIcon
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
        </div>
      </header>
      <div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-60 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Fine For skeleton
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ) : hasError ? (
          <div className="py-8 text-center">
            <p className="text-destructive mb-4">
              Error loading category data. Please try again.
            </p>
            <Button onClick={handleRefresh} disabled={isRefetching}>
              {isRefetching ? "Refreshing..." : "Retry"}
            </Button>
          </div>
        ) : consolidatedCategories.length > 0 ? (
          <>
            <div className="mb-6 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="name"
                    label={({ name, percent }) =>
                      window.innerWidth > 640
                        ? `${name} (${(percent * 100).toFixed(0)}%)`
                        : ""
                    }
                  >
                    {processedCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.id || index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      maxHeight: "100px",
                      overflowY: "auto",
                      fontSize: "0.875rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {consolidatedCategories.map((category, index) => {
                const percentage =
                  totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;

                return (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    percentage={percentage}
                    color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No spending categories found for this period.
            </p>

            <Button
              className="py-4"
              onClick={() => setSelectedDate(new Date())}
            >
              Set to Current
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
