import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import type { Ticker } from "@my-dashboard/shared";
import { Card, CardContent } from "@/components/ui/card";

interface TickersTableProps {
	tickers: Ticker[];
	isLoading: boolean;
	isError: boolean;
	errorMessage?: string;
}

export function TickersTable({
	tickers,
	isLoading,
	isError,
	errorMessage = "Error loading tickers. Please try again later.",
}: TickersTableProps) {
	if (isLoading) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Symbol</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Exchange</TableHead>
						<TableHead>Type</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{[1, 2, 3, 4].map((i) => (
						<TableRow key={i}>
							<TableCell>
								<Skeleton className="h-4 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-20" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	if (isError) {
		return (
			<div className="p-4 bg-red-50 text-red-700 rounded-md">
				{errorMessage}
			</div>
		);
	}

	if (tickers.length === 0) {
		return (
			<div className="bg-gray-50 p-4 rounded-md text-gray-600">
				No tickers are currently being tracked.
			</div>
		);
	}

	return (
		<Card>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Symbol</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Exchange</TableHead>
							<TableHead>Type</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{tickers.map((ticker) => (
							<TableRow key={ticker.id}>
								<TableCell className="font-medium">{ticker.symbol}</TableCell>
								<TableCell>{ticker.name || "-"}</TableCell>
								<TableCell>{ticker.exchange}</TableCell>
								<TableCell>{ticker.quote_type || "-"}</TableCell>
								<TableCell className="text-right">
									<Button variant="outline" size="sm" asChild>
										<Link
											to={`/investing/ticker/${ticker.exchange}/${ticker.symbol}`}
										>
											View Details
										</Link>
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
