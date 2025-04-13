import type { Industry, Sector } from "@my-dashboard/shared";
import { useMemo } from "react";
import { useIndustries } from "./useIndustries";
import { useSectors } from "./useSectors";

export function useEntityMappings() {
	const { sectors = [], isLoading: sectorsLoading } = useSectors();
	const { industries = [], isLoading: industriesLoading } = useIndustries();

	const mappings = useMemo(() => {
		return {
			sectorMap: new Map(sectors.map((sector: Sector) => [sector.id, sector])),
			industryMap: new Map(
				industries.map((industry: Industry) => [industry.id, industry]),
			),
			isLoading: sectorsLoading || industriesLoading,
		};
	}, [sectors, industries, sectorsLoading, industriesLoading]);

	return mappings;
}
