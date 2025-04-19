import { chessApi } from "@/api/chessApi";
import { getMonthRange } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function useRecentGames(selectedDate: Date, limit = 10) {
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: ["recent_games", monthStart, limit],
		queryFn: () => chessApi.getRecentGames(selectedDate, limit),
	});
}
