import { api } from "@/lib/api";
import { type CurrencyPair, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseCurrencyPairsOptions {
  staleTime?: number;
  retry?: number | boolean;
  enabled?: boolean;
}
export function useCurrencyPairs(options: UseCurrencyPairsOptions = {}) {
  const {
    data: pairs = [],
    isLoading,
    isError,
    error,
  } = useQuery<CurrencyPair[]>({
    queryKey: queryKeys.forex.currencyPairs(),
    queryFn: () => api.forex.getCurrencyPairs(),
    staleTime: options.staleTime,
    retry: options.retry,
    enabled: options.enabled ?? true,
  });

  return {
    pairs,
    isLoading,
    isError,
    error,
  };
}
