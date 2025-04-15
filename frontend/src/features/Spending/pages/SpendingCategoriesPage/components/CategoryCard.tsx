import type { CategoryData } from "@/api/spendingApi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { spendingCategoryDetailRoute } from "@/routes/spending-routes";
import { Link } from "@tanstack/react-router";
import { memo } from "react";

type CategoryCardProps = {
	category: CategoryData;
	percentage?: number;
	color?: string;
};

export const CategoryCard = memo(
	({ category, percentage, color = "#0088FE" }: CategoryCardProps) => {
		return (
			<Link
				to={spendingCategoryDetailRoute.to}
				params={{ categoryId: category.id }}
			>
				<Card className="overflow-hidden transition-all hover:shadow-md">
					<CardContent className="p-0">
						<div className="h-1.5" style={{ backgroundColor: color }} />
						<div className="p-2 px-4 sm:py-4">
							<h3 className="text-sm sm:text-base font-medium truncate">
								{category.name}
							</h3>
							<div className="flex pt-1 justify-between items-baseline">
								<p className="text-xl sm:text-2xl font-semibold">
									${category.amount.toFixed(2)}
								</p>
								{percentage !== undefined && (
									<p className="text-xs sm:text-sm text-muted-foreground">
										{percentage.toFixed(1)}%
									</p>
								)}
							</div>
						</div>
					</CardContent>
					<CardFooter className="bg-muted/50 px-4 sm:px-5 py-2.5 text-xs sm:text-sm">
						<p className="text-muted-foreground">View receipts →</p>
					</CardFooter>
				</Card>
			</Link>
		);
	},
);
