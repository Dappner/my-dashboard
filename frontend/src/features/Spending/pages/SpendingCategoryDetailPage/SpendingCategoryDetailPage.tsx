import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useMonthParam } from "@/hooks/useMonthParam";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { format } from "date-fns";
import { useMemo } from "react";
import { useCategoryData } from "../../hooks/useCategoryData";
import { DistributionChart } from "./components/DistributionChart";
import { CategoryHeader } from "./components/CategoryHeader";
import { ReceiptList } from "./components/ReceiptList";

export default function SpendingCategoryDetailPage() {
  const { categoryId } = spendingCategoryDetailRoute.useParams();
  const { selectedDate, setSelectedDate } = useMonthParam();
  const { convertAmount, displayCurrency } = useCurrencyConversion();

  const {
    details: categoryDetails,
    receipts,
    items,
    isLoading,
  } = useCategoryData(categoryId || "", selectedDate);

  // Prepare data for pie chart - receipt spending breakdown with currency conversion
  const pieChartData = useMemo(() => {
    if (!receipts.length) return [];

    return receipts.map((receipt) => {
      // Calculate total for this receipt's items in this category
      const receiptItems = items.filter(
        (item) => item.receipt_id === receipt.id,
      );

      // Sum all items and convert to user's currency
      const value = receiptItems.reduce((sum, item) => {
        const itemAmount = item.total_price || 0;
        return sum + convertAmount(itemAmount, receipt.currency_code);
      }, 0);

      return {
        name:
          receipt.store_name ||
          format(new Date(receipt.purchase_date), "MMM d, yyyy"),
        value,
        id: receipt.id,
        currency: displayCurrency, // Already converted
      };
    });
  }, [receipts, items, convertAmount, displayCurrency]);

  if (isLoading) return <LoadingState />;

  // Convert totalSpent without relying on currencyBreakdown
  const convertedTotalSpent = receipts.reduce((total, receipt) => {
    const receiptItems = items.filter((item) => item.receipt_id === receipt.id);
    const receiptTotal = receiptItems.reduce(
      (sum, item) =>
        sum + convertAmount(item.total_price || 0, receipt.currency_code),
      0,
    );
    return total + receiptTotal;
  }, 0);

  return (
    <PageContainer>
      <CategoryHeader
        name={categoryDetails?.name || ""}
        description={categoryDetails?.description || undefined}
        totalSpent={convertedTotalSpent}
        receiptCount={receipts.length}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart isLoading={isLoading} chartData={pieChartData} />

        <ReceiptList
          isLoading={isLoading}
          receipts={receipts}
          items={items}
          categoryName={categoryDetails?.name || ""}
          convertAmount={convertAmount}
        />
      </div>
    </PageContainer>
  );
}
