import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AppRoutes } from "@/navigation";
import { Link } from "react-router-dom";

type CategoryCardProps = {
	id: string;
	name: string;
	amount: number;
	percentage?: number;
	color?: string;
};

export function CategoryCard({
	id,
	name,
	amount,
	percentage,
	color = "#0088FE",
}: CategoryCardProps) {
	return (
		<Link to={AppRoutes.spending.categories.detail(id)}>
			<Card className="overflow-hidden transition-all hover:shadow-md">
				<CardContent className="p-0">
					<div className="h-2" style={{ backgroundColor: color }} />
					<div className="p-6">
						<h3 className="text-base font-medium truncate">{name}</h3>
						<div className="mt-1 flex justify-between items-baseline">
							<p className="text-2xl font-semibold">${amount.toFixed(2)}</p>
							{percentage !== undefined && (
								<p className="text-sm text-muted-foreground">
									{percentage.toFixed(1)}%
								</p>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="bg-muted/50 py-2 px-6">
					<p className="text-sm text-muted-foreground">View receipts →</p>
				</CardFooter>
			</Card>
		</Link>
	);
}
