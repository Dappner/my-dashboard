import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthParam } from "@/hooks/useMonthParam";
import { format } from "date-fns";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import useRecentGames from "../hooks/useRecentGames";

export default function RecentGamesFeed() {
	const { selectedDate } = useMonthParam();
	const { data, isLoading } = useRecentGames(selectedDate, 10);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[...Array(5)].map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
					<Skeleton key={i} className="h-12 w-full rounded" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{data?.map((game) => (
				<Card key={game.id} className="p-3 flex items-center justify-between">
					<div>
						<div className="text-sm font-medium">
							{format(new Date(game.end_time), "MMM d, yyyy HH:mm")}
						</div>
						<div className="text-xs text-gray-500">
							{game.time_class} vs {game.opponent_username}
						</div>
					</div>
					<div className="flex items-center">
						{game.is_win ? (
							<CheckCircleIcon className="h-5 w-5 text-green-600" />
						) : (
							<XCircleIcon className="h-5 w-5 text-red-600" />
						)}
						<span className="ml-2 text-sm">
							{game.user_rating} ↔ {game.opponent_rating}
						</span>
					</div>
				</Card>
			))}
		</div>
	);
}
