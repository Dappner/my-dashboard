import { PageContainer } from "@/components/layout/components/PageContainer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { SectorsAndIndustries } from "./components/SectorsAndIndustries";
import { StatsOverview } from "./components/StatsOverview";
import { WatchlistSidebar } from "./components/WatchlistSidebar";

export default function ResearchOverview() {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<PageContainer className="px-0 sm:px-0 md:px-0 lg:px-0">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-8">
				<div className="relative w-full md:w-80">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					<Input
						placeholder="Search sectors, industries, or tickers..."
						className="pl-10 py-6 rounded-full border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						aria-label="Search market data"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-8 sm:px-8">
					<StatsOverview />
				</div>
				<div className="lg:col-span-1 sm:pr-8">
					<WatchlistSidebar />
				</div>
				<section className="lg:col-span-3">
					<h2 className="text-xl font-semibold text-gray-900 mb-4 px-8">
						Sectors & Industries
					</h2>
					<SectorsAndIndustries />
				</section>
			</div>
		</PageContainer>
	);
}
