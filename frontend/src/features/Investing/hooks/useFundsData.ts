import { useQuery } from "@tanstack/react-query";
import { TopHolding, SectorWeighting, AssetClass } from "@/types/fundTypes";
import { fundApi, fundApiKeys } from "@/api/fundsApi";

interface FundsData {
  topHoldings: TopHolding[];
  sectorWeightings: SectorWeighting[];
  assetClasses: AssetClass[];
  isLoading: boolean;
}

export const useFundsData = (tickerId?: string): FundsData => {
  const { data: topHoldings = [], isLoading: holdingsLoading } = useQuery({
    queryFn: () => fundApi.getTopHoldings(tickerId!),
    queryKey: fundApiKeys.topHoldings(tickerId!),
    enabled: !!tickerId,
  });

  const { data: sectorWeightings = [], isLoading: sectorsLoading } = useQuery({
    queryFn: () => fundApi.getSectorWeightings(tickerId!),
    queryKey: fundApiKeys.sectorWeightings(tickerId!),
    enabled: !!tickerId,
  });

  const { data: assetClasses = [], isLoading: assetClassesLoading } = useQuery({
    queryFn: () => fundApi.getAssetClasses(tickerId!),
    queryKey: fundApiKeys.assetClasses(tickerId!),
    enabled: !!tickerId,
  });

  const isLoading = holdingsLoading || sectorsLoading || assetClassesLoading;

  return {
    topHoldings,
    sectorWeightings,
    assetClasses,
    isLoading
  }
}
