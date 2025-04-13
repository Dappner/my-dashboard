import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndustryDisplay } from "@/features/Investing/components/IndustryDisplay";
import { SectorDisplay } from "@/features/Investing/components/SectorDisplay";
import { formatCategoryName } from "@/lib/formatting";
import { supabase } from "@/lib/supabase";
import type { HistoricalPrice, Ticker } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseIcon, MapPinIcon } from "lucide-react";

interface TickerHeaderProps {
	ticker: Ticker;
	isLoading: boolean;
}

export default function TickerHeader({ ticker, isLoading }: TickerHeaderProps) {
	const isFund = ticker?.quote_type !== "EQUITY";

	//TODO: Let's get more recent pricing during market. And put that somewhere...
	const { data: latestHistoricalPrice, isLoading: priceLoading } = useQuery({
		queryKey: [ticker, "latestPrice"],
		queryFn: async () => {
			const { data } = await supabase
				.from("historical_prices")
				.select()
				.eq("ticker_id", ticker.id)
				.order("date", { ascending: false })
				.limit(1);

			if (!data) return null;
			return data[0] as HistoricalPrice;
		},
	});

	const onClickEdgar = () => {
		window.open(
			`https://www.sec.gov/edgar/browse/?CIK=${ticker?.cik}&owner=exclude`,
			"_blank",
		);
	};

	const dataLoading = isLoading || priceLoading;

	return (
		<div className="lg:flex lg:items-center lg:justify-between p-4 sm:p-0 pb-0">
			<div className="min-w-0 flex-1">
				{dataLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-8 w-1/3" />
						<Skeleton className="h-6 w-1/4" />
						<div className="flex space-x-6 mt-2">
							<div className="flex items-center">
								<Skeleton className="h-5 w-5 mr-1.5" />
								<Skeleton className="h-5 w-24" />
							</div>
							<div className="flex items-center">
								<Skeleton className="h-5 w-5 mr-1.5" />
								<Skeleton className="h-5 w-32" />
							</div>
						</div>
					</div>
				) : (
					<>
						<h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
							{ticker?.name}
						</h2>
						<h2 className="text-xl/7 font-semibold text-gray-700 sm:truncate sm:text-2xl sm:tracking-tight">
							$
							{latestHistoricalPrice?.close_price?.toFixed(2) ??
								latestHistoricalPrice?.open_price?.toFixed(2)}
							<span className="text-sm pl-2 text-gray-600">
								({latestHistoricalPrice?.date})
							</span>
						</h2>
						<div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
							{isFund ? (
								<>
									<div className="mt-2 flex items-center text-sm text-gray-500">
										<BriefcaseIcon
											aria-hidden="true"
											className="mr-1.5 size-5 shrink-0 text-gray-400"
										/>
										{formatCategoryName(ticker?.category, "N/A")}
									</div>
									<div className="mt-2 flex items-center text-sm text-gray-500">
										<MapPinIcon
											aria-hidden="true"
											className="mr-1.5 size-5 shrink-0 text-gray-400"
										/>
										{ticker?.region || "N/A"}
									</div>
								</>
							) : (
								<>
									<div className="mt-2 flex items-center text-sm text-gray-500">
										<BriefcaseIcon
											aria-hidden="true"
											className="mr-1.5 size-5 shrink-0 text-gray-400"
										/>
										<SectorDisplay sectorId={ticker.sector_id || ""} />
									</div>
									<div className="mt-2 flex items-center text-sm text-gray-500">
										<MapPinIcon
											aria-hidden="true"
											className="mr-1.5 size-5 shrink-0 text-gray-400"
										/>
										<IndustryDisplay industryId={ticker.industry_id || ""} />
									</div>
								</>
							)}
						</div>
					</>
				)}
			</div>
			<div className="flex gap-4 mt-4 lg:mt-0">
				{dataLoading ? (
					<Skeleton className="h-10 w-20" />
				) : (
					ticker?.cik && <Button onClick={onClickEdgar}>Edgar</Button>
				)}
			</div>
		</div>
	);
}
