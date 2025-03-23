import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subMonths } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ReceiptIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase"; // Assuming you have a Supabase client

// Types for the data we'll fetch
interface MonthlyData {
  month: string;
  amount: number;
}

interface CategoryData {
  name: string;
  amount: number;
}

interface SpendingOverviewData {
  totalSpent: number;
  receiptCount: number;
  monthlyTrend: number;
  monthlyData: MonthlyData[];
  categories: CategoryData[];
}

export default function SpendingOverview() {
  const today = new Date();
  const currentMonth = format(today, "MMMM yyyy");
  const lastMonth = format(subMonths(today, 1), "MMMM yyyy");

  const { data, isLoading, error } = useSuspenseQuery<SpendingOverviewData>({
    queryKey: ["spendingOverview"],
    queryFn: async () => {
      // Get current and last month's dates
      const currentMonthStart = format(today, "yyyy-MM-01");
      const lastMonthStart = format(subMonths(today, 1), "yyyy-MM-01");
      const sixMonthsAgo = format(subMonths(today, 6), "yyyy-MM-01");

      // Fetch total spent and receipt count for current month
      const { data: currentMonthData } = await supabase
        .schema("grocery")
        .from("receipts")
        .select("total_amount, id")
        .gte("purchase_date", currentMonthStart);

      const totalSpent = currentMonthData?.reduce(
        (sum, receipt) => sum + (receipt.total_amount || 0),
        0,
      ) || 0;
      const receiptCount = currentMonthData?.length || 0;

      // Fetch last month's total for trend calculation
      const { data: lastMonthData } = await supabase
        .schema("grocery")
        .from("receipts")
        .select("total_amount")
        .gte("purchase_date", lastMonthStart)
        .lt("purchase_date", currentMonthStart);

      const lastMonthTotal = lastMonthData?.reduce(
        (sum, receipt) => sum + (receipt.total_amount || 0),
        0,
      ) || 0;
      const monthlyTrend = lastMonthTotal > 0
        ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

      // Fetch 6 months of data for trend chart
      const { data: monthlyDataRaw } = await supabase
        .schema("grocery")
        .from("receipts")
        .select("purchase_date, total_amount")
        .gte("purchase_date", sixMonthsAgo)
        .order("purchase_date", { ascending: true });

      const monthlyData = Object.entries(
        monthlyDataRaw?.reduce((acc, receipt) => {
          const month = format(new Date(receipt.purchase_date), "MMM yyyy");
          acc[month] = (acc[month] || 0) + (receipt.total_amount || 0);
          return acc;
        }, {} as Record<string, number>) || {},
      ).map(([month, amount]) => ({ month, amount }));

      // Fetch category breakdown
      const { data: categoryDataRaw } = await supabase
        .schema("grocery")
        .from("receipt_items")
        .select("categories(name), total_price")
        .gte("created_at", currentMonthStart)
        .not("category_id", "is", null);

      const categories = Object.entries(
        categoryDataRaw?.reduce((acc, item) => {
          const categoryName = item.categories?.name || "Uncategorized";
          acc[categoryName] = (acc[categoryName] || 0) +
            (item.total_price || 0);
          return acc;
        }, {} as Record<string, number>) || {},
      ).map(([name, amount]) => ({ name, amount }));

      return {
        totalSpent,
        receiptCount,
        monthlyTrend,
        monthlyData,
        categories,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading spending data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading spending data</div>;
  }

  if (!data) {
    return <div>No spending data available</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Spending Overview</h1>
        <p className="text-muted-foreground">
          Track and analyze your spending habits
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent ({currentMonth})
                </CardTitle>
                <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${data.totalSpent.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.monthlyTrend > 0
                    ? (
                      <span className="flex items-center text-red-500">
                        <ArrowUpIcon className="mr-1 h-4 w-4" />
                        {data.monthlyTrend.toFixed(1)}% from {lastMonth}
                      </span>
                    )
                    : (
                      <span className="flex items-center text-green-500">
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                        {Math.abs(data.monthlyTrend).toFixed(1)}% from{" "}
                        {lastMonth}
                      </span>
                    )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receipts This Month
                </CardTitle>
                <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.receiptCount}</div>
                <p className="text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4 inline" />
                  {currentMonth}
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Average Daily Spend</CardTitle>
                <CardDescription>
                  Daily average: $
                  {(data.totalSpent /
                    new Date(today.getFullYear(), today.getMonth() + 1, 0)
                      .getDate()).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>
                How your spending has evolved over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  <Legend />
                  <Bar dataKey="amount" name="Monthly Spend" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                Breakdown of spending across different categories this month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.categories}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  <Legend />
                  <Bar dataKey="amount" name="Amount Spent" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
