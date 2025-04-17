import { receiptsApi, receiptsApiKeys } from "@/api/receiptsApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const useReceipts = (selectedDate: Date) => {
  const cacheKey = format(selectedDate, "yyyy-MM");
  return useQuery({
    queryKey: receiptsApiKeys.monthlyData(cacheKey),
    queryFn: () => receiptsApi.getReceiptsWithItems(selectedDate),
    enabled: !!selectedDate,
  });
};
