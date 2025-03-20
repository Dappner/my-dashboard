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

// Mock function to fetch spending data - replace with your actual API call
const fetchSpendingData = async () => {
  // This would be your Supabase query or other data fetching mechanism
  return {
    totalSpent: 1245.67,
    receiptCount: 28,
    monthlyTrend: 8.5, // percentage increase from last month
    categories: [
      { name: "Groceries", amount: 387.22 },
      { name: "Dining", amount: 235.89 },
      { name: "Shopping", amount: 312.45 },
      { name: "Entertainment", amount: 189.11 },
      { name: "Other", amount: 121.00 },
    ],
    monthlyData: [
      { month: "Jan", amount: 980.54 },
      { month: "Feb", amount: 1050.32 },
      { month: "Mar", amount: 1120.87 },
      { month: "Apr", amount: 1140.23 },
      { month: "May", amount: 1210.76 },
      { month: "Jun", amount: 1160.45 },
      { month: "Jul", amount: 1245.67 },
    ],
  };
};

export default function SpendingOverview() {
  const today = new Date();
  const currentMonth = format(today, "MMMM yyyy");
  const lastMonth = format(subMonths(today, 1), "MMMM yyyy");

  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: ["spendingOverview"],
    queryFn: fetchSpendingData,
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
                        {data.monthlyTrend}% from {lastMonth}
                      </span>
                    )
                    : (
                      <span className="flex items-center text-green-500">
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                        {Math.abs(data.monthlyTrend)}% from {lastMonth}
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
                  Daily average: ${(data.totalSpent / 30).toFixed(2)}
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
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Amount"]}
                    />
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
                How your spending has evolved over the past months
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
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                  />
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
                Breakdown of spending across different categories
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
                  <YAxis dataKey="name" type="category" />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                  />
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
