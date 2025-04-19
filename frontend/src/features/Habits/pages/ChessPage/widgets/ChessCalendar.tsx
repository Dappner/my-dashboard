import type React from "react";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTimeframeParams } from "@/hooks/useTimeframeParams";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
} from "date-fns";
import type { MonthlyActivity } from "@/api/chessApi";
import { useMonthlyActivity } from "../hooks/useChessHooks";
import { cn } from "@/lib/utils";

// choose color by performance
const getDayColor = (wins: number, losses: number, games: number) => {
  if (games === 0) return "bg-transparent";
  const style = games > 3 ? "font-bold text-white" : "text-white";
  if (wins > losses) return `bg-green-600 ${style}`;
  if (losses > wins) return `bg-red-600 ${style}`;
  return `bg-blue-600 ${style}`;
};

export const ChessCalendar: React.FC = () => {
  const { timeframe, date, dateRange } = useTimeframeParams();
  const { data: activityData, isLoading } = useMonthlyActivity(date, timeframe);

  type Daily = MonthlyActivity;

  // build map from date string to row
  const activityMap = useMemo(
    () =>
      (activityData ?? []).reduce<Record<string, Daily>>(
        (map, row) => {
          if (row.day) {
            map[row.day] = row;
          }
          return map;
        },
        {} as Record<string, Daily>,
      ),
    [activityData],
  );

  // generic day-grid renderer
  const renderDayGrid = (days: Date[]) => {
    // pad to week boundary (Sunday)
    const padCount = days[0]?.getDay() ?? 0;
    const padded: Array<Date | null> = [...Array(padCount).fill(null), ...days];
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      const chunk = padded.slice(i, i + 7);
      while (chunk.length < 7) chunk.push(null);
      weeks.push(chunk);
    }
    console.log(weeks);

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Fine
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((dt, di) => {
              const key = dt ? format(dt, "yyyy-MM-dd") : `empty-${wi}-${di}`;
              if (!dt) return <div key={key} className="aspect-square" />;
              const {
                games_played = 0,
                wins = 0,
                losses = 0,
              } = activityMap[format(dt, "yyyy-MM-dd")] ?? {};
              const color = getDayColor(
                wins || 0,
                losses || 0,
                games_played || 0,
              );
              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`aspect-square rounded-md flex items-center justify-center border ${color}`}
                      >
                        <span className="text-sm">{format(dt, "d")}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p className="font-medium">
                          {format(dt, "EEEE, MMM d, yyyy")}
                        </p>
                        {(games_played || -1) > 0 ? (
                          <>
                            <p>Games: {games_played}</p>
                            <p className="text-green-600">W: {wins}</p>
                            <p className="text-red-600">L: {losses}</p>
                            <p>
                              Other:
                              {(games_played || 0) -
                                (wins || 0) -
                                (losses || 0)}
                            </p>
                          </>
                        ) : (
                          <p>No games</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render weekly grid with aggregated data
  const renderWeeklyGrid = () => {
    const weeks = eachWeekOfInterval(dateRange, { weekStartsOn: 0 });
    const isQuarter = timeframe === "q";

    return (
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-7">
        {weeks.map((weekStart) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

          let games = 0;
          let wins = 0;
          let losses = 0;
          for (const d of days) {
            const dateKey = format(d, "yyyy-MM-dd");
            const row = activityMap[dateKey];
            if (row) {
              games += row.games_played || 0;
              wins += row.wins || 0;
              losses += row.losses || 0;
            }
          }

          const color = getDayColor(wins, losses, games);
          const key = format(weekStart, "yyyy-MM-dd");

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "rounded-md flex items-center justify-center border",
                      isQuarter ? "aspect-square" : "h-16",
                      color,
                    )}
                  >
                    <div className="text-xs">
                      <div>{format(weekStart, "MMM d")}</div>
                      {games > 0 && <div>{games} games</div>}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">
                      Week of {format(weekStart, "MMM d, yyyy")}
                    </p>
                    {games > 0 ? (
                      <>
                        <p>Games: {games}</p>
                        <p className="text-green-600">W: {wins}</p>
                        <p className="text-red-600">L: {losses}</p>
                        <p>Other: {games - wins - losses}</p>
                      </>
                    ) : (
                      <p>No games</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  // Render monthly grid with aggregated data
  const renderMonthlyGrid = () => {
    const months = eachMonthOfInterval(dateRange);

    return (
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
        {months.map((m) => {
          const key = format(m, "yyyy-MM");
          const days = eachDayOfInterval({ start: m, end: endOfMonth(m) });

          let games = 0;
          let wins = 0;
          let losses = 0;
          for (const d of days) {
            const dateKey = format(d, "yyyy-MM-dd");
            const row = activityMap[dateKey];
            if (row) {
              games += row.games_played || 0;
              wins += row.wins || 0;
              losses += row.losses || 0;
            }
          }

          const color = getDayColor(wins, losses, games);

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`h-14 rounded-md flex items-center justify-center border ${color}`}
                  >
                    <div className="text-xs">
                      <div>{format(m, "MMM yyyy")}</div>
                      {games > 0 && <div>{games} games</div>}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">{format(m, "MMMM yyyy")}</p>
                    {games > 0 ? (
                      <>
                        <p>Games: {games}</p>
                        <p className="text-green-600">W: {wins}</p>
                        <p className="text-red-600">L: {losses}</p>
                        <p>Other: {games - wins - losses}</p>
                      </>
                    ) : (
                      <p>No games</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  // view renderers based on timeframe
  const getContent = () => {
    switch (timeframe) {
      case "w":
      case "m":
        return renderDayGrid(eachDayOfInterval(dateRange));
      case "q":
      case "y":
        return renderWeeklyGrid();
      case "all":
        return renderMonthlyGrid();
      default:
        return renderDayGrid(eachDayOfInterval(dateRange));
    }
  };

  const titleMap: Record<string, string> = {
    "1W": "Weekly Activity",
    "1M": "Monthly Activity",
    "3M": "Quarterly Activity",
    YTD: "Year to Date Activity",
    "1Y": "Yearly Activity",
    ALL: "All-Time Activity",
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>{titleMap[timeframe] || "Activity"}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">
        {isLoading ? (
          <div className="h-48 w-full bg-gray-200 animate-pulse rounded" />
        ) : (
          getContent()
        )}
      </CardContent>
    </Card>
  );
};
