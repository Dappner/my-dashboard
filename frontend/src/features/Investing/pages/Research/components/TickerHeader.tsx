import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	formatCategoryName,
	formatIndustryName,
	formatSectorName,
} from "@/lib/formatting";
import type { Ticker } from "@/types/tickerTypes";
import { BriefcaseIcon, MapPinIcon } from "lucide-react";

interface TickerHeaderProps {
	ticker: Ticker;
	latestPrice?: number | null;
	isLoading: boolean;
}
export default function TickerHeader({
	ticker,
	latestPrice,
	isLoading,
}: TickerHeaderProps) {
	const isFund = ticker?.quote_type !== "EQUITY";

	const onClickEdgar = () => {
		window.open(
			`https://www.sec.gov/edgar/browse/?CIK=${ticker?.cik}&owner=exclude`,
			"_blank",
		);
	};

	return (
		<div className="lg:flex lg:items-center lg:justify-between">
			<div className="min-w-0 flex-1">
				{isLoading ? (
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
							${latestPrice}
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
										{formatSectorName(ticker?.sector, "N/A")}
									</div>
									<div className="mt-2 flex items-center text-sm text-gray-500">
										<MapPinIcon
											aria-hidden="true"
											className="mr-1.5 size-5 shrink-0 text-gray-400"
										/>
										{formatIndustryName(ticker?.industry)}
									</div>
								</>
							)}
						</div>
					</>
				)}
			</div>
			<div className="flex gap-4 mt-4 lg:mt-0">
				{isLoading ? (
					<Skeleton className="h-10 w-20" />
				) : (
					ticker?.cik && <Button onClick={onClickEdgar}>Edgar</Button>
				)}
			</div>
		</div>
	);
}
