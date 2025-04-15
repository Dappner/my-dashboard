import type { CategoryData } from "@/api/spendingApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, Receipt as ReceiptIcon, TrendingUp } from "lucide-react";
import { SpendingTrendIndicator } from "./SpendingTrendIndicator";

interface SpendingKpiCardsProps {
  totalSpent: number;
  receiptCount: number;
  trend: number;
  averageDailySpend: number;
  categories: CategoryData[];
  month: string;
  isLoading?: boolean;
}

export const SpendingKpiCards: React.FC<SpendingKpiCardsProps> = ({
  totalSpent,
  receiptCount,
  categories,
  month,
  trend,
  averageDailySpend,
  isLoading = false,
}) => {
  // Find the category with the highest amount
  const topCategory = categories.reduce(
    (max, category) => (category.amount > max.amount ? category : max),
    categories[0] || { id: "", name: "None", amount: 0 },
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Total Spent
          </CardTitle>
          <CardDescription className="text-xs">{month}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ReceiptIcon className="h-4 w-4 mr-2" />
            Receipts
          </CardTitle>
          <CardDescription className="text-xs">{month}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{receiptCount}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <CalendarIcon className="mr-1 h-3 w-3" /> {month}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-lg">Top Category</CardTitle>
          <CardDescription className="text-xs">{month}</CardDescription>
        </CardHeader>
        <CardContent>
          {topCategory.id ? (
            <>
              <Link
                className="text-xl font-bold hover:underline"
                to={spendingCategoryDetailRoute.to}
                params={{ categoryId: topCategory.id }}
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
          <p className="text-xs text-muted-foreground">{month}</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${averageDailySpend.toFixed(2)}
          </div>
          <SpendingTrendIndicator trend={trend} />
        </CardContent>
      </Card>
    </div>
  );
};
