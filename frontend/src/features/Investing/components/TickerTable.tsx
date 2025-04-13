import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { monthsShort } from "@/features/Investing/constants";
import { AppRoutes } from "@/navigation";
import type { Ticker } from "@my-dashboard/shared";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEntityMappings } from "../hooks/useEntityMappings";
import { IndustryDisplay } from "./IndustryDisplay";
import { SectorDisplay } from "./SectorDisplay";

export type TickerTableVariant = "simple" | "admin";

interface TickerTableProps {
	tickers: Ticker[];
	variant?: TickerTableVariant;
	isLoading?: boolean;
	onSymbolClick?: (ticker: Ticker) => void;
	onEdit?: (ticker: Ticker) => void;
	onDelete?: (ticker: Ticker) => void;
	emptyMessage?: string;
}

export function TickerTable({
	tickers,
	variant = "simple",
	isLoading = false,
	onSymbolClick,
	onEdit,
	onDelete,
	emptyMessage = "No tickers available",
}: TickerTableProps) {
	const { sectorMap, industryMap } = useEntityMappings();
	// Helper for rendering Symbol cell with click handler
	const renderSymbol = (ticker: Ticker) => (
		<span
			className={
				onSymbolClick ? "font-bold cursor-pointer hover:underline" : "font-bold"
			}
			onClick={onSymbolClick ? () => onSymbolClick(ticker) : undefined}
			onKeyDown={
				onSymbolClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								onSymbolClick(ticker);
							}
						}
					: undefined
			}
			tabIndex={onSymbolClick ? 0 : undefined}
			role={onSymbolClick ? "button" : undefined}
		>
			{ticker.symbol}
		</span>
	);

	// Helper for rendering dividend months
	const renderDividendMonths = (ticker: Ticker) => {
		if (!ticker.dividend_months?.length) return "-";
		return ticker.dividend_months.length === 12
			? "Monthly"
			: ticker.dividend_months.map((val: number) => monthsShort[val]).join(",");
	};

	// Helper for rendering actions
	const renderActions = (ticker: Ticker) => (
		<div className="flex justify-end space-x-2">
			{onEdit && (
				<Button variant="ghost" size="icon" onClick={() => onEdit(ticker)}>
					<Pencil className="h-4 w-4" />
				</Button>
			)}
			{onDelete && (
				<Button variant="ghost" size="icon" onClick={() => onDelete(ticker)}>
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			)}
		</div>
	);

	const renderViewDetails = (ticker: Ticker) => {
		// If it's a sector or industry index (from YHD exchange)
		if (ticker.exchange === "YHD" && ticker.quote_type === "INDEX") {
			// Determine if this is a sector or industry index based on ID patterns or naming
			if (ticker.sector_id && !ticker.industry_id) {
				// This is likely a sector index
				const sectorKey = sectorMap.get(ticker.sector_id)?.key;
				return (
					<Button variant="outline" size="sm" asChild>
						<Link to={AppRoutes.investing.sector(sectorKey || "")}>
							View Sector
						</Link>
					</Button>
				);
			}
			if (ticker.industry_id) {
				const industryKey = industryMap.get(ticker.industry_id)?.key;
				return (
					<Button variant="outline" size="sm" asChild>
						<Link to={AppRoutes.investing.industry(industryKey || "")}>
							View Industry
						</Link>
					</Button>
				);
			}
		}

		// Default case - regular ticker
		return (
			<Button variant="outline" size="sm" asChild>
				<Link
					to={
						ticker.exchange && ticker.symbol
							? AppRoutes.investing.ticker(ticker.exchange, ticker.symbol)
							: "#"
					}
				>
					View Details
				</Link>
			</Button>
		);
	};

	// Define columns based on variant
	const columns = (() => {
		// These columns appear in all variants
		const baseColumns = [
			{ header: "Symbol", render: renderSymbol },
			{ header: "Name", render: (ticker: Ticker) => ticker.name || "-" },
			{
				header: "Exchange",
				render: (ticker: Ticker) => ticker.exchange || "-",
			},
		];

		switch (variant) {
			case "simple":
				return [
					...baseColumns,
					{
						header: "Type",
						render: (ticker: Ticker) => ticker.quote_type || "-",
					},
					{
						header: "",
						className: "text-right",
						render: renderViewDetails,
					},
				];

			case "admin":
				return [
					...baseColumns,
					{
						header: "Sector",
						render: (ticker: Ticker) =>
							ticker.sector_id ? (
								<SectorDisplay sectorId={ticker.sector_id} />
							) : (
								"-"
							),
					},
					{
						header: "Industry",
						render: (ticker: Ticker) =>
							ticker.industry_id ? (
								<IndustryDisplay industryId={ticker.industry_id} />
							) : (
								"-"
							),
					},
					{
						header: "Div Amount",
						render: (ticker: Ticker) =>
							`$${ticker.dividend_amount?.toFixed(2) || "-"}`,
					},
					{
						header: "Div Months",
						render: renderDividendMonths,
					},
					{
						header: "Actions",
						className: "text-right",
						render: renderActions,
					},
				];

			default:
				return baseColumns;
		}
	})();

	// Render loading skeleton
	if (isLoading) {
		return (
			<div className="w-full border rounded-md bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.header}>{column.header}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 4 }).map((_, rowIndex) => (
							<TableRow
								key={`loading-${
									// biome-ignore lint/suspicious/noArrayIndexKey: Fine for loading states
									rowIndex
								}`}
							>
								{columns.map((column) => (
									<TableCell key={`loading-${rowIndex}-${column.header}`}>
										<Skeleton className="h-4 w-24" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	// Render empty state
	if (tickers.length === 0) {
		return (
			<div className="bg-gray-50 p-4 rounded-md text-gray-600">
				{emptyMessage}
			</div>
		);
	}

	// Render table with data
	return (
		<div className="w-full border rounded-md bg-white">
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHead key={column.header}>{column.header}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{tickers.map((ticker) => (
						<TableRow key={ticker.id}>
							{columns.map((column) => (
								<TableCell key={`${ticker.id}-${column.header}`}>
									{column.render(ticker)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
