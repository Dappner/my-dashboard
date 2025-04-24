import KpiCard from "@/components/customs/KpiCard";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { investingDashboardRoute } from "@/routes/investing-routes";
import { spendingCategoriesRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { PieChartIcon, TrendingUp } from "lucide-react";
import PortfolioChart from "../Investing/components/PortfolioChart/PortfolioChart";
import { usePortfolioMetrics } from "../Investing/hooks/usePortfolioMetrics";
import { SpendingKpiCards } from "../Spending/components/SpendingKpiCards";
import {
	CompactHabitsTracker,
	useHabitsData,
} from "./components/HabitsTracker";

export default function HomePage() {
	const { metrics, isLoading: metricsLoading } = usePortfolioMetrics("ALL");
	const { data: habitsData, isLoading: habitsLoading } = useHabitsData();

	const isLoading = metricsLoading || habitsLoading;

	if (isLoading) return <LoadingState />;

	return (
		<PageContainer className="px-2 sm:px-0">
			<section className="space-y-2">
				<div className="flex justify-between items-center">
					<h2 className="text-base font-semibold sm:text-lg">Investing</h2>
					<Link
						to={investingDashboardRoute.to}
						className="text-xs text-blue-500 hover:underline sm:text-sm"
					>
						Details
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<KpiCard
						title="Portfolio Value"
						value={`$${metrics?.currentTotalValue.toLocaleString(undefined, {
							maximumFractionDigits: 0,
						})}`}
						icon={TrendingUp}
					/>
					<KpiCard
						title="Gain/Loss"
						value={`$${metrics?.currentUnrealizedPL.toLocaleString(undefined, {
							maximumFractionDigits: 0,
						})}`}
						positiveChange={(metrics?.currentUnrealizedPL || -1) > 0}
						icon={TrendingUp}
					/>
					<div className="col-span-2">
						<PortfolioChart
							timeframe="1W"
							type="absolute"
							// isDashboard={true}
						/>
					</div>
				</div>
			</section>

			<section className="space-y-2">
				<div className="flex justify-between items-center">
					<h2 className="text-base font-semibold sm:text-lg">
						Spending
						<span className="text-sm pl-1 font-normal text-gray-600">
							(this Month)
						</span>
					</h2>
					<Link
						to="/spending"
						className="text-xs text-blue-500 hover:underline sm:text-sm"
					>
						Details
					</Link>
				</div>
				<SpendingKpiCards />
				<div className="grid gap-4 sm:grid-cols-2">
					<Card>
						<CardHeader className="flex flex-col">
							<CardTitle className="text-lg font-semibold flex items-center">
								<PieChartIcon className="size-4 mr-2" />
								<Link
									to={spendingCategoriesRoute.to}
									className="hover:underline"
								>
									Spending by Category
								</Link>
							</CardTitle>
						</CardHeader>
						<div className="p-6 pt-0">
							{/* TODO: REimplement */}
							{/* <CategoryPieChart */}
							{/* 	categories={spendingMetrics?.categories || []} */}
							{/* /> */}
						</div>
					</Card>
				</div>
			</section>

			<section className="space-y-2">
				<div className="flex justify-between items-center">
					<h2 className="text-base font-semibold sm:text-lg">Habits</h2>
					{/* <Link */}
					{/*   className="text-xs text-blue-500 hover:underline sm:text-sm" */}
					{/* > */}
					{/*   Details */}
					{/* </Link> */}
				</div>
				<CompactHabitsTracker
					habitsData={habitsData || { chess: [], commits: [] }}
				/>
			</section>
		</PageContainer>
	);
}
