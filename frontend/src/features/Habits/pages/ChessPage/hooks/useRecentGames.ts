import { useQuery } from "@tanstack/react-query";
import { getMonthRange } from "@/lib/utils";
import { chessApi } from "@/api/chessApi";

export default function useRecentGames(selectedDate: Date, limit = 10) {
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: ["recent_games", monthStart, limit],
		queryFn: () => chessApi.getRecentGames(selectedDate, limit),
	});
}
