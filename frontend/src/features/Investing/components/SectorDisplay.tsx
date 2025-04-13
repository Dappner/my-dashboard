import { Skeleton } from "@/components/ui/skeleton";
import { useSectors } from "@/features/Investing/hooks/useSectors";
import { AppRoutes } from "@/navigation";
import { Link } from "react-router-dom";

interface SectorDisplayProps {
	sectorId: string;
	asLink?: boolean;
}

export function SectorDisplay({
	sectorId,
	asLink = false,
}: SectorDisplayProps) {
	const { sectors = [], isLoading } = useSectors();

	if (isLoading) return <Skeleton className="h-4 w-24 inline-block" />;
	if (!sectorId) return <span className="text-muted">-</span>;

	const sector = sectors.find((s) => s.id === sectorId);
	if (!sector) return <span>-</span>;

	if (asLink) {
		return (
			<Link
				to={AppRoutes.investing.sector(sector.id)}
				className="text-blue-600 hover:underline"
			>
				{sector.name}
			</Link>
		);
	}

	return <span>{sector.name}</span>;
}
