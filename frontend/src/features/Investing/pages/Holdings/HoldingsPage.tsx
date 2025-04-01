import { PageContainer } from "@/components/layout/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolioMetrics } from "../../hooks/usePortfolioMetrics";
import AllocationTab from "./tabs/AllocationTab";
import DividendTab from "./tabs/DividendTab";
import OverviewTab from "./tabs/OverviewTab";
import RiskTab from "./tabs/RiskTab";

export default function HoldingsPage() {
	const timeframe = "ALL";

	const { metrics, isLoading, error } = usePortfolioMetrics(timeframe);

	if (isLoading) {
		return (
			<div className={"flex flex-row gap-x-2"}>
				<Skeleton className="h-16 w-full rounded-md" />
				<Skeleton className="h-16 w-full rounded-md" />
				<Skeleton className="h-16 w-full rounded-md" />
			</div>
		);
	}

	if (error || !metrics) {
		return <div className={"text-red-600 "}>Error loading KPIs.</div>;
	}

	return (
		<PageContainer>
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview" className="cursor-pointer">
						Overview
					</TabsTrigger>
					<TabsTrigger value="allocation" className="cursor-pointer">
						Allocation
					</TabsTrigger>
					<TabsTrigger value="dividends" className="cursor-pointer">
						Dividends
					</TabsTrigger>
					<TabsTrigger value="risk" className="cursor-pointer">
						Risk
					</TabsTrigger>
				</TabsList>
				<TabsContent value="overview">
					<OverviewTab />
				</TabsContent>
				<TabsContent value="allocation">
					<AllocationTab />
				</TabsContent>
				<TabsContent value="dividends">
					<DividendTab />
				</TabsContent>
				<TabsContent value="risk">
					<RiskTab />
				</TabsContent>
			</Tabs>
		</PageContainer>
	);
}
