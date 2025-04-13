import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { useHistoricalPrices } from "../hooks/useHistoricalPrices";
import { useIndustries } from "../hooks/useIndustries";
import { useSector } from "../hooks/useSector";
import { useTickersBySector } from "../hooks/useTickersBySector";
import { useSectorIndex } from "../hooks/useMarketIndices";
import TimeframeControls from "@/components/controls/TimeFrameControls";
import type { Timeframe } from "@my-dashboard/shared";
import { TickersTable } from "../components/TickersTable";
import { PerformanceChart } from "./Research/components/PerformanceChart";

export default function SectorPage() {
	const { sectorSlug } = useParams<{ sectorSlug: string }>();
	const [timeframe, setTimeframe] = useState<Timeframe>("3M");

	// Fetch sector details
	const {
		sector,
		isLoading: isLoadingSector,
		isError: isErrorSector,
	} = useSector(sectorSlug || "", { withIndustries: false });

	// Fetch sector index
	const { sectorIndex, isLoading: isLoadingSectorIndex } = useSectorIndex(
		sectorSlug || "",
	);

	// Fetch historical prices for sector index
	const {
		prices: sectorPrices,
		isLoading: isLoadingSectorPrices,
		isError: isErrorSectorPrices,
	} = useHistoricalPrices(sectorIndex?.id || "", {
		timeframe,
		enabled: Boolean(sectorIndex?.id),
	});

	// Fetch S&P 500 prices
	const { prices: spyPrices } = useHistoricalPrices(
		"8da9010d-cc57-4088-9538-5d414ce3a6ee",
		{
			timeframe,
		},
	);

	// Fetch industries
	const {
		industries,
		isLoading: isLoadingIndustries,
		isError: isErrorIndustries,
	} = useIndustries({ sectorKey: sectorSlug });

	// Fetch tickers
	const {
		tickers,
		isLoading: isLoadingTickers,
		isError: isErrorTickers,
	} = useTickersBySector(sectorSlug || "");

	// Loading state
	if (isLoadingSector) {
		return (
			<PageContainer>
				<div className="p-6 space-y-8">
					<div className="flex justify-between">
						<Skeleton className="h-10 w-3/4" />
						<Skeleton className="h-10 w-1/4" />
					</div>
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="h-80 w-full" />
					<Skeleton className="h-8 w-1/4" />
					<Skeleton className="h-40 w-full" />
				</div>
			</PageContainer>
		);
	}

	// Error state
	if (isErrorSector || !sector) {
		return (
			<PageContainer>
				<div className="p-6">
					<h1 className="text-3xl font-bold mb-4">Sector Not Found</h1>
					<p>We couldn't find information for the sector "{sectorSlug}".</p>
					<Button asChild className="mt-4">
						<Link to="/investing/sectors">Explore All Sectors</Link>
					</Button>
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold mb-2">{sector.name}</h1>
					{sector.description && (
						<p className="text-gray-600 mb-3">{sector.description}</p>
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-3 text-sm">
				{sector.companies_count && (
					<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
						{sector.companies_count} Companies
					</span>
				)}
				{sector.market_cap && (
					<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
						Market Cap: ${(sector.market_cap / 1_000_000_000_000).toFixed(2)}T
					</span>
				)}
				{sector.market_weight && (
					<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
						{(sector.market_weight * 100).toFixed(1)}% of Market
					</span>
				)}
			</div>

			{/* Performance Chart */}

			<div className="flex justify-end items-center mb-2 h-8 px-2 sm:px-0">
				<TimeframeControls
					timeframe={timeframe}
					onTimeframeChange={setTimeframe}
				/>
			</div>
			<Card className="shadow-sm">
				<CardContent>
					<PerformanceChart
						prices={sectorPrices}
						comparisonPrices={spyPrices}
						isLoading={isLoadingSectorPrices || isLoadingSectorIndex}
						isError={isErrorSectorPrices}
						primaryLabel={`${sector.name} Performance`}
						comparisonLabel="S&P 500"
						primaryColor="#10b981"
						comparisonColor="#6366f1"
					/>
				</CardContent>
			</Card>

			{/* Industries Grid */}
			<section>
				<h2 className="text-xl font-semibold mb-4">Industries</h2>
				{isErrorIndustries ? (
					<div className="p-4 bg-red-50 text-red-700 rounded-md">
						Error loading industries. Please try again later.
					</div>
				) : isLoadingIndustries ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : industries.length === 0 ? (
					<div className="bg-gray-50 p-4 rounded-md text-gray-600">
						No industries found for this sector.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
						{industries.map((industry) => (
							<Link
								key={industry.id}
								to={`/investing/industry/${industry.key}`}
								className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-center"
							>
								<div className="font-medium">{industry.name}</div>
								{industry.companies_count && (
									<div className="text-xs text-gray-600 mt-1">
										{industry.companies_count} companies
									</div>
								)}
							</Link>
						))}
					</div>
				)}
			</section>

			{/* Tickers Table */}
			<section>
				<h2 className="text-xl font-semibold mb-4">
					Top Tickers ({tickers.length})
				</h2>
				<TickersTable
					tickers={tickers.slice(0, 4)}
					isLoading={isLoadingTickers}
					isError={isErrorTickers}
				/>
				{tickers.length > 4 && (
					<div className="mt-4 text-center">
						<Button variant="outline" asChild>
							<Link to={`/investing/sector/${sectorSlug}/tickers`}>
								View All {tickers.length} Tickers
							</Link>
						</Button>
					</div>
				)}
			</section>
		</PageContainer>
	);
}
