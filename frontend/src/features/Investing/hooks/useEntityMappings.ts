import type { Industry, Sector } from "@my-dashboard/shared";
import { useMemo } from "react";
import { useIndustries } from "./useIndustries";
import { useSectors } from "./useSectors";

export function useEntityMappings() {
	const { sectors = [], isLoading: sectorsLoading } = useSectors();
	const { industries = [], isLoading: industriesLoading } = useIndustries();

	const mappings = useMemo(() => {
		return {
			// Maps from ID to full sector object
			sectorMap: new Map(sectors.map((sector: Sector) => [sector.id, sector])),

			// Maps from sector key to full sector object
			sectorKeyMap: new Map(
				sectors.map((sector: Sector) => [sector.key, sector]),
			),

			// Maps from ID to full industry object
			industryMap: new Map(
				industries.map((industry: Industry) => [industry.id, industry]),
			),

			// Maps from industry key to full industry object
			industryKeyMap: new Map(
				industries.map((industry: Industry) => [industry.key, industry]),
			),

			// Helper functions for common lookups
			getSectorName: (id?: string) =>
				id ? sectors.find((s) => s.id === id)?.name || "-" : "-",
			getIndustryName: (id?: string) =>
				id ? industries.find((i) => i.id === id)?.name || "-" : "-",
			getSectorByKey: (key?: string) =>
				key ? sectors.find((s) => s.key === key) : undefined,
			getIndustryByKey: (key?: string) =>
				key ? industries.find((i) => i.key === key) : undefined,

			isLoading: sectorsLoading || industriesLoading,
		};
	}, [sectors, industries, sectorsLoading, industriesLoading]);

	return mappings;
}
