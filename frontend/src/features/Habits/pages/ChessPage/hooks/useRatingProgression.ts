import { chessApi, ratingProgressionApiKeys } from "@/api/chessApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function useRatingProgression(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");
	return useQuery({
		queryKey: ratingProgressionApiKeys.month(cacheKey),
		queryFn: () => chessApi.getRatingProgression(selectedDate),
	});
}
