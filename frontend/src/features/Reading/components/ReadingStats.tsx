import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, LineChart, Target, TrendingUp } from "lucide-react";
import type { ReadingStatsData } from "../types";

interface ReadingStatsProps {
	stats: ReadingStatsData;
}

export const ReadingStats = ({ stats }: ReadingStatsProps) => {
	const statsItems = [
		{
			icon: <BookOpen className="size-5" />,
			label: "Books Read",
			value: stats.booksReadThisYear,
			comparison: stats.booksReadLastYear,
			comparisonLabel: "last year",
			trend: stats.booksReadThisYear > stats.booksReadLastYear ? "up" : "down",
		},
		{
			icon: <Target className="size-5" />,
			label: "Pages Read",
			value: stats.pagesReadThisYear,
			suffix: "pages",
		},
		{
			icon: <TrendingUp className="size-5" />,
			label: "Books per Month",
			value: stats.averageBooksPerMonth,
			suffix: "books",
		},
		{
			icon: <LineChart className="size-5" />,
			label: "Favorite Genre",
			value: stats.favGenre,
			isText: true,
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{statsItems.map((item) => (
				<Card key={item.label} className="overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-center gap-2 text-muted-foreground mb-2">
							{item.icon}
							<span className="text-sm">{item.label}</span>
						</div>
						<div className="text-2xl font-bold">
							{item.isText ? item.value : item.value.toLocaleString()}
							{item.suffix && (
								<span className="text-sm font-normal ml-1">{item.suffix}</span>
							)}
						</div>
						{item.comparison && (
							<div className="mt-1 text-xs flex items-center">
								<span
									className={`${item.trend === "up" ? "text-green-500" : "text-red-500"} flex items-center`}
								>
									{item.trend === "up" ? "↑" : "↓"}
									<span className="ml-1">
										vs {item.comparison} {item.comparisonLabel}
									</span>
								</span>
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
};
