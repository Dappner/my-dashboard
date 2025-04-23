import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import { formatDate } from "@/lib/utils";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { useMemo } from "react";
import { useCategoryData } from "../../hooks/useCategoryData";
import { CategoryHeader } from "./components/CategoryHeader";
import { DistributionChart } from "./components/DistributionChart";
import { ReceiptList } from "./components/ReceiptList";

export default function SpendingCategoryDetailPage() {
	const { categoryId } = spendingCategoryDetailRoute.useParams();
	const { date, timeframe } = useTimeframeParams();
	const { convertAmount, displayCurrency } = useCurrencyConversion();

	const {
		details: categoryDetails,
		receipts,
		isLoading,
	} = useCategoryData(categoryId || "", date, timeframe);

	const pieChartData = useMemo(
		() =>
			receipts?.map((r) => {
				const value = r.receipt_items.reduce(
					(sum, i) => sum + convertAmount(i.total_price ?? 0, r.currency_code),
					0,
				);
				return {
					name: r.store_name || formatDate(r.purchase_date),
					value,
					id: r.id,
					currency: displayCurrency,
				};
			}),
		[receipts, convertAmount, displayCurrency],
	);

	// Compute total spent from pieChartData
	const convertedTotalSpent = useMemo(
		() => pieChartData?.reduce((sum, d) => sum + d.value, 0),
		[pieChartData],
	);

	if (isLoading) return <LoadingState />;

	return (
		<PageContainer>
			<CategoryHeader
				name={categoryDetails?.name || ""}
				description={categoryDetails?.description || undefined}
				totalSpent={convertedTotalSpent || 0}
				receiptCount={receipts?.length || 0}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<DistributionChart
					isLoading={isLoading}
					chartData={pieChartData || []}
				/>

				<ReceiptList
					isLoading={isLoading}
					receipts={receipts || []}
					categoryName={categoryDetails?.name || ""}
					convertAmount={convertAmount}
				/>
			</div>
		</PageContainer>
	);
}
