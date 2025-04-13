import { spendingMetricsApi } from "@/api/spendingApi";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, isAfter, startOfMonth, subMonths } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Receipt as ReceiptIcon,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSpendingMetrics } from "./hooks/useSpendingMetrics";
import { ActivityFeed } from "./components/ActivityFeed";
import LoadingState from "@/components/layout/components/LoadingState";
import ErrorState from "@/components/layout/components/ErrorState";
import { CategoryPieChart } from "./components/CategoryPieChart";

const NoDataState: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    No spending data available
  </div>
);

const TrendIndicator: React.FC<{ trend: number }> = ({ trend }) => (
  <p className="text-xs text-muted-foreground flex items-center">
    {trend > 0
      ? (
        <span className="flex items-center text-red-500">
          <ArrowUpIcon className="mr-1 h-3 w-3" />
          {trend.toFixed(1)}%
        </span>
      )
      : (
        <span className="flex items-center text-green-500">
          <ArrowDownIcon className="mr-1 h-3 w-3" />
          {Math.abs(trend).toFixed(1)}%
        </span>
      )}
  </p>
);

const ChartContainer: React.FC<{
  title: string;
  children: React.ReactElement;
  height: number;
}> = ({ title, children, height }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const TopCategory: React.FC<{
  categories: { name: string; amount: number }[];
}> = ({ categories }) => {
  const topCategory = categories.reduce(
    (max, category) => (category.amount > max.amount ? category : max),
    categories[0] || { name: "None", amount: 0 },
  );

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Category</CardTitle>
        <CardDescription>This Month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{topCategory.name}</div>
        <p className="text-sm text-muted-foreground">
          ${topCategory.amount.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
};
export default function SpendingOverview() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Memoize the date to ensure stable query keys
  const queryDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(1); // Use local day setter
    date.setHours(0, 0, 0, 0); // Use local time setter
    return date;
  }, [selectedDate]);
  const { spendingMetrics, isLoading, error } = useSpendingMetrics(queryDate);

  const { data: recentReceipts } = useQuery({
    queryKey: ["recentReceipts", selectedDate],
    queryFn: () => spendingMetricsApi.getRecentReceipts(selectedDate),
  });

  const currentMonthStart = startOfMonth(new Date());

  const isNextDisabled = !isAfter(currentMonthStart, queryDate);
  const handlePrevMonth = () => setSelectedDate((prev) => subMonths(prev, 1));

  const handleNextMonth = () =>
    setSelectedDate((prev) => {
      const nextMonthDate = addMonths(prev, 1);
      const nextMonthStart = startOfMonth(nextMonthDate);

      if (isAfter(nextMonthStart, currentMonthStart)) {
        return prev;
      }
      return nextMonthDate;
    });

  const currentMonth = format(queryDate, "MMMM yyyy");

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={"Error loading Spending"} />;
  if (!spendingMetrics) return <NoDataState />;

  return (
    <PageContainer className="min-h-screen">
      <div>
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Spending Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Track and analyze your spending habits
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentMonth}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
              aria-label="Next month"
              disabled={isNextDisabled}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Top Row with Summary Cards and Category Pie Chart */}
        <div className="grid gap-4 md:grid-cols-12 mb-6">
          {/* Summary Cards - Left Side */}
          <div className="md:col-span-8 grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total Spent
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentMonth}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${spendingMetrics.totalSpent.toFixed(2)}
                </div>
                <TrendIndicator trend={spendingMetrics.monthlyTrend} />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ReceiptIcon className="h-4 w-4 mr-2" />
                  Receipts
                </CardTitle>
                <CardDescription className="text-xs">
                  This Month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {spendingMetrics.receiptCount}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" /> {currentMonth}
                </p>
              </CardContent>
            </Card>

            <TopCategory categories={spendingMetrics.categories} />
          </div>

          {/* Category Pie Chart - Right Side */}
          <div className="md:col-span-4">
            <CategoryPieChart
              categories={spendingMetrics.categories}
              month={currentMonth}
            />
          </div>
        </div>

        {/* Bottom Row with Charts and Activity Feed */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* Charts */}
          <div className="md:col-span-8">
            <ChartContainer title="Monthly Spending Trend" height={300}>
              <BarChart data={spendingMetrics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="md:col-span-4">
            <ActivityFeed receipts={recentReceipts || []} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
