import { useQuery } from "@tanstack/react-query";
import type { Api } from "../api";
import { queryKeys } from "../api";

export const createUseHoldings = (api: Api) => () => {
  return useQuery({
    queryKey: queryKeys.holdings.all,
    queryFn: () => api.holdings.getAll(),
  });
};
