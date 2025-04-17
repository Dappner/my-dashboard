import React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContributionHeatmapProps {
  selectedDate: Date;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  selectedDate,
}) => {
  // Generate mock data for the calendar
  const generateMockContributions = (date: Date) => {
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });

    // Generate random contribution counts for each day
    return daysInMonth.map((day) => {
      // More contributions on weekdays, fewer on weekends for realistic data
      const isWeekend = [0, 6].includes(getDay(day));
      const maxContrib = isWeekend ? 5 : 12;
      const count = Math.floor(Math.random() * maxContrib);

      return {
        date: day,
        count,
        level: getContributionLevel(count),
      };
    });
  };

  const getContributionLevel = (count: number): string => {
    if (count === 0) return "none";
    if (count <= 3) return "low";
    if (count <= 6) return "medium";
    if (count <= 9) return "high";
    return "very-high";
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "none":
        return "bg-muted";
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900";
      case "medium":
        return "bg-emerald-300 dark:bg-emerald-700";
      case "high":
        return "bg-emerald-500 dark:bg-emerald-500";
      case "very-high":
        return "bg-emerald-700 dark:bg-emerald-300";
      default:
        return "bg-muted";
    }
  };

  // Generate a weeks array for the grid layout
  const generateCalendarWeeks = (contributions: any[]) => {
    const firstDayOfMonth = startOfMonth(selectedDate);
    const firstDayOfWeek = getDay(firstDayOfMonth);

    // Create a 2D array of weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = Array(firstDayOfWeek).fill(null); // Fill with nulls for days before the 1st

    contributions.forEach((day, index) => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill the last week with nulls if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const contributions = generateMockContributions(selectedDate);
  const weeks = generateCalendarWeeks(contributions);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="contribution-calendar min-w-[700px]">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 text-xs">
          {/* Empty cell for spacing with day labels */}
          <div className="" />

          {/* Day labels (Sun-Sat) */}
          {days.map((day) => (
            <div key={day} className="text-center text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {/* Week label */}
              <div className="text-right pr-2 text-muted-foreground py-1">
                {week.some(
                  (day) => (day && day.date.getDate() === 1) || weekIndex === 0,
                )
                  ? format(
                    week.find((day) => day)?.date || weeks[0][0].date,
                    "MMM",
                  )
                  : ""}
              </div>

              {/* Days in this week */}
              {week.map((day, dayIndex) => (
                <TooltipProvider key={dayIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                        h-6 rounded 
                        ${day ? getLevelColor(day.level) : "bg-transparent"}
                      `}
                      ></div>
                    </TooltipTrigger>
                    {day && (
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">
                            {format(day.date, "MMM d, yyyy")}
                          </p>
                          <p>
                            {day.count} contribution{day.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center mt-4 text-xs text-muted-foreground">
          <span className="mr-2">Less</span>
          {["none", "low", "medium", "high", "very-high"].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 mx-0.5 rounded ${getLevelColor(level)}`}
            ></div>
          ))}
          <span className="ml-2">More</span>
        </div>
      </div>
    </div>
  );
};
