import { Skeleton } from "@/components/ui/skeleton";
import { investingIndustryRoute } from "@/routes/investing-routes";
import { Link } from "@tanstack/react-router";
import { useEntityMappings } from "../hooks/useEntityMappings";

interface IndustryDisplayProps {
	industryId?: string;
	asLink?: boolean;
}

export function IndustryDisplay({
	industryId,
	asLink = false,
}: IndustryDisplayProps) {
	const { industryMap, isLoading } = useEntityMappings();

	if (isLoading) return <Skeleton className="h-4 w-24 inline-block" />;
	if (!industryId) return <span className="text-muted">-</span>;

	const industry = industryMap.get(industryId);
	if (!industry) return <span>-</span>;

	if (asLink) {
		return (
			<Link
				to={investingIndustryRoute.to}
				params={{ industrySlug: industry.key }}
				className="text-blue-600 hover:underline"
			>
				{industry.name}
			</Link>
		);
	}

	return <span>{industry.name}</span>;
}
