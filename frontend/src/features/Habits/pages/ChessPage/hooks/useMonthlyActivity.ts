import { useQuery } from "@tanstack/react-query";
import { chessApi, monthlyActivityApiKeys } from "@/api/chessApi";
import { getMonthRange } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function useMonthlyActivity(selectedDate: Date) {
	const { userId } = useAuth();
	const { monthStart } = getMonthRange(selectedDate);
	return useQuery({
		queryKey: monthlyActivityApiKeys.month(monthStart),
		queryFn: () => chessApi.getMonthlyActivity(selectedDate),
		enabled: !!userId,
	});
}
