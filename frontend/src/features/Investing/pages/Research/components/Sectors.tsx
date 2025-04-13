import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import { useSectors } from "@/features/Investing/hooks/useSectors";

// Types for sorting
type SortKey = "name" | "market_weight";
type SortOrder = "asc" | "desc";

export default function Sectors() {
	const { sectors, isLoading, isError, refetch } = useSectors({
		queryOptions: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 2,
		},
	});

	const [sortKey, setSortKey] = useState<SortKey>("market_weight");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	// Sorting logic
	const sortedSectors = [...sectors].sort((a, b) => {
		if (sortKey === "name") {
			return sortOrder === "asc"
				? a.name.localeCompare(b.name)
				: b.name.localeCompare(a.name);
		}
		// Default to market_weight
		const aWeight = a.market_weight ?? 0;
		const bWeight = b.market_weight ?? 0;
		return sortOrder === "asc" ? aWeight - bWeight : bWeight - aWeight;
	});

	// Toggle sort order
	const toggleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header with Sort Controls */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h2 className="text-2xl font-semibold text-gray-900">Market Sectors</h2>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => toggleSort("name")}
						className="rounded-full hover:bg-blue-50"
						aria-label={`Sort by name, currently ${
							sortKey === "name" ? sortOrder : "unsorted"
						}`}
					>
						Name
						{sortKey === "name" &&
							(sortOrder === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : (
								<ArrowDown className="ml-2 h-4 w-4" />
							))}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toggleSort("market_weight")}
						className="rounded-full hover:bg-blue-50"
						aria-label={`Sort by market weight, currently ${
							sortKey === "market_weight" ? sortOrder : "unsorted"
						}`}
					>
						Market Weight
						{sortKey === "market_weight" &&
							(sortOrder === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : (
								<ArrowDown className="ml-2 h-4 w-4" />
							))}
					</Button>
				</div>
			</div>

			{/* Error State */}
			{isError && (
				<Alert variant="destructive" className="bg-red-50 border-red-200">
					<AlertCircle className="h-5 w-5 text-red-500" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load sectors. Please try again.
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="ml-4 mt-2 rounded-full border-red-300 hover:bg-red-100"
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{Array(8)
						.fill(0)
						.map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Fine for skeleton
							<Skeleton key={i} className="h-48 rounded-lg" />
						))}
				</div>
			)}

			{/* Sectors Grid */}
			{!isLoading && !isError && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{sortedSectors.map((sector) => (
						<Card
							key={sector.id}
							className="hover:shadow-md transition-shadow border-none bg-white"
							// biome-ignore lint/a11y/useSemanticElements: Fine
							role="article"
							aria-label={`Sector: ${sector.name}`}
						>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg font-semibold text-gray-900 truncate">
									{sector.name}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{sector.market_weight && (
									<p className="text-sm text-gray-600">
										Market Weight:{" "}
										<span className="font-medium text-gray-900">
											{(sector.market_weight * 100).toFixed(1)}%
										</span>
									</p>
								)}
								{sector.companies_count && (
									<p className="text-sm text-gray-600">
										Companies:{" "}
										<span className="font-medium text-gray-900">
											{sector.companies_count}
										</span>
									</p>
								)}
								{sector.market_cap && (
									<p className="text-sm text-gray-600">
										Market Cap:{" "}
										<span className="font-medium text-gray-900">
											${(sector.market_cap / 1e9).toFixed(2)}B
										</span>
									</p>
								)}
								<Button
									asChild
									variant="outline"
									size="sm"
									className="mt-4 w-full rounded-full hover:bg-blue-50"
								>
									<Link to={`/investing/sector/${sector.key}`}>
										View Details
									</Link>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && sectors.length === 0 && (
				<Card className="border-none bg-white">
					<CardContent className="py-12 text-center">
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No Sectors Found
						</h3>
						<p className="text-sm text-gray-500">
							It looks like there are no sectors available at the moment.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
