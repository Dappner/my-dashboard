import { Skeleton } from "@/components/ui/skeleton";
import { investingSectorRoute } from "@/routes/investing-routes";
import { Link } from "@tanstack/react-router";
import { useEntityMappings } from "../hooks/useEntityMappings";

interface SectorDisplayProps {
	sectorId: string;
	asLink?: boolean;
}

export function SectorDisplay({
	sectorId,
	asLink = false,
}: SectorDisplayProps) {
	const { sectorMap, isLoading } = useEntityMappings();

	if (isLoading) return <Skeleton className="h-4 w-24 inline-block" />;
	if (!sectorId) return <span className="text-muted">-</span>;

	const sector = sectorMap.get(sectorId);
	if (!sector) return <span>-</span>;

	if (asLink) {
		return (
			<Link
				to={investingSectorRoute.to}
				params={{ sectorSlug: sector.key }}
				className="text-blue-600 hover:underline"
			>
				{sector.name}
			</Link>
		);
	}

	return <span>{sector.name}</span>;
}
