import { useQuery } from "@tanstack/react-query";
import { chessApi, monthlySummaryApiKeys } from "@/api/chessApi";
import { getMonthRange } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function useMonthlySummary(selectedDate: Date) {
	const { userId } = useAuth();
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: monthlySummaryApiKeys.month(monthStart),
		queryFn: () => chessApi.getMonthlySummary(selectedDate),
		enabled: !!userId,
	});
}
