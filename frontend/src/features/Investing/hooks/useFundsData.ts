import { api } from "@/lib/api";
import {
	type AssetClass,
	type SectorWeighting,
	type TopHolding,
	queryKeys,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface FundsData {
	topHoldings: TopHolding[];
	sectorWeightings: SectorWeighting[];
	assetClasses: AssetClass[];
	isLoading: boolean;
}

export const useFundsData = (tickerId?: string): FundsData => {
	const { data: topHoldings = [], isLoading: holdingsLoading } = useQuery({
		queryFn: () => api.funds.getTopHoldings(tickerId),
		queryKey: queryKeys.funds.topHoldings(tickerId),
		enabled: !!tickerId,
	});

	const { data: sectorWeightings = [], isLoading: sectorsLoading } = useQuery({
		queryFn: () => api.funds.getSectorWeightings(tickerId),
		queryKey: queryKeys.funds.sectorWeightings(tickerId),
		enabled: !!tickerId,
	});

	const { data: assetClasses = [], isLoading: assetClassesLoading } = useQuery({
		queryFn: () => api.funds.getAssetClasses(tickerId),
		queryKey: queryKeys.funds.assetClasses(tickerId),
		enabled: !!tickerId,
	});

	const isLoading = holdingsLoading || sectorsLoading || assetClassesLoading;

	return {
		topHoldings,
		sectorWeightings,
		assetClasses,
		isLoading,
	};
};
