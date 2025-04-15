import TimeframeControls from "@/components/controls/TimeFrameControls";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatting";
import {
	investingResearchRoute,
	investingSectorRoute,
} from "@/routes/investing-routes";
import type { Timeframe } from "@my-dashboard/shared";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { TickerTable } from "../components/TickerTable";
import { useHistoricalPrices } from "../hooks/useHistoricalPrices";
import { useIndustry } from "../hooks/useIndustry";
import { useIndustryIndex, useSectorIndex } from "../hooks/useMarketIndices";
import { useTickersByIndustry } from "../hooks/useTickersByIndustry";
import { PerformanceChart } from "./Research/components/PerformanceChart";

export default function IndustryPage() {
	const { industrySlug } = useParams({
		strict: false,
	});
	const [timeframe, setTimeframe] = useState<Timeframe>("3M");

	// Fetch industry details
	const {
		industry,
		isLoading: isLoadingIndustry,
		isError: isErrorIndustry,
	} = useIndustry(industrySlug || "");

	// Fetch industry index
	const { industryIndex, isLoading: isLoadingIndustryIndex } = useIndustryIndex(
		industrySlug || "",
	);

	// Fetch historical prices for industry index
	const {
		prices: industryPrices,
		isLoading: isLoadingIndustryPrices,
		isError: isErrorIndustryPrices,
	} = useHistoricalPrices(industryIndex?.id || "", {
		timeframe,
		enabled: Boolean(industryIndex?.id),
	});

	// Fetch sector index for comparison
	const sectorKey = industry?.sector?.key || "";
	const { sectorIndex } = useSectorIndex(sectorKey, {
		enabled: Boolean(sectorKey),
	});

	// Fetch sector prices
	const { prices: sectorPrices } = useHistoricalPrices(sectorIndex?.id || "", {
		timeframe,
		enabled: Boolean(sectorIndex?.id),
	});

	// Fetch tickers
	const { tickers, isLoading: isLoadingTickers } = useTickersByIndustry(
		industrySlug || "",
	);

	// Format industry name
	const industryName =
		industry?.name ||
		(industrySlug
			? industrySlug
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ")
			: "Industry");

	// Loading state
	if (isLoadingIndustry) {
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
	if (isErrorIndustry || !industry) {
		return (
			<PageContainer>
				<div className="p-6">
					<h1 className="text-3xl font-bold mb-4">Industry Not Found</h1>
					<p>We couldn't find information for the industry "{industrySlug}".</p>
					<Button asChild className="mt-4">
						<Link to={investingResearchRoute.to}>Explore Sectors</Link>
					</Button>
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold mb-2">{industryName}</h1>
					{industry.description && (
						<p className="text-gray-600 mb-3">{industry.description}</p>
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-3 text-sm">
				{industry.companies_count && (
					<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
						{industry.companies_count} Companies
					</span>
				)}
				{industry.market_cap && (
					<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
						Market Cap: {formatCurrency(industry.market_cap, true)}
					</span>
				)}
				{industry.sector && (
					<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
						<Link
							to={investingSectorRoute.to}
							params={{ sectorSlug: industry.sector.key }}
							className="hover:underline"
						>
							{industry.sector.name} Sector
						</Link>
					</span>
				)}
			</div>

			<div className="flex justify-end items-center mb-2 h-8 px-2 sm:px-0">
				<TimeframeControls
					timeframe={timeframe}
					onTimeframeChange={setTimeframe}
				/>
			</div>
			<Card className="shadow-sm">
				<CardContent>
					<PerformanceChart
						prices={industryPrices || []}
						comparisonPrices={sectorPrices || []}
						isLoading={isLoadingIndustryPrices || isLoadingIndustryIndex}
						isError={isErrorIndustryPrices}
						primaryLabel={`${industryName} Performance`}
						comparisonLabel={`${industry.sector?.name || "Sector"} Average`}
						primaryColor="#3b82f6"
						comparisonColor="#10b981"
					/>
				</CardContent>
			</Card>

			{/* Tickers Table */}
			<section>
				<h2 className="text-xl font-semibold mb-4">
					Tracked Tickers ({tickers.length})
				</h2>
				<TickerTable tickers={tickers} isLoading={isLoadingTickers} />
			</section>
		</PageContainer>
	);
}
