import { chessApi, monthlyActivityApiKeys } from "@/api/chessApi";
import { useAuth } from "@/contexts/AuthContext";
import { getMonthRange } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function useMonthlyActivity(selectedDate: Date) {
	const { userId } = useAuth();
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: monthlyActivityApiKeys.month(monthStart),
		queryFn: () => chessApi.getMonthlyActivity(selectedDate),
		enabled: !!userId,
	});
}
