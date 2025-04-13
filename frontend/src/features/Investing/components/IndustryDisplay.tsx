import { useIndustries } from "@/features/Investing/hooks/useIndustries";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { AppRoutes } from "@/navigation";

interface IndustryDisplayProps {
	industryId?: string;
	asLink?: boolean;
}

export function IndustryDisplay({
	industryId,
	asLink = false,
}: IndustryDisplayProps) {
	const { industries = [], isLoading } = useIndustries();

	if (isLoading) return <Skeleton className="h-4 w-24 inline-block" />;
	if (!industryId) return <span className="text-muted">-</span>;

	const industry = industries.find((i) => i.id === industryId);
	if (!industry) return <span>-</span>;

	if (asLink) {
		return (
			<Link
				to={AppRoutes.investing.industry(industry.id)}
				className="text-blue-600 hover:underline"
			>
				{industry.name}
			</Link>
		);
	}

	return <span>{industry.name}</span>;
}
