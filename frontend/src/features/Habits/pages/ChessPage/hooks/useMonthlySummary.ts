import { chessApi, monthlySummaryApiKeys } from "@/api/chessApi";
import { useAuth } from "@/contexts/AuthContext";
import { getMonthRange } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function useMonthlySummary(selectedDate: Date) {
	const { userId } = useAuth();
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: monthlySummaryApiKeys.month(monthStart),
		queryFn: () => chessApi.getMonthlySummary(selectedDate),
		enabled: !!userId,
	});
}
