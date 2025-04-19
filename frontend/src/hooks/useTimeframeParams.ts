import { alignToPeriodStart, getTimeframeRange } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";

export function useTimeframeParams() {
  const { timeframe: urlTimeframe, date: urlDate } = useSearch({
    strict: false,
  });
  const navigate = useNavigate();

  // 1. Init state from URL (or defaults)
  const [timeframe, setTimeframeState] = useState<Timeframe>(
    (urlTimeframe as Timeframe) || "m",
  );
  const [date, setDateState] = useState<Date>(
    urlDate ? parse(urlDate, "yyyy-MM-dd", new Date()) : new Date(),
  );

  // 2. Centralized URL updater
  const updateURL = (params: { timeframe?: Timeframe; date?: Date }) => {
    const tf = params.timeframe ?? timeframe;
    const dt = params.date ?? date;
    navigate({
      search: (prev) => ({
        ...prev,
        timeframe: tf,
        date: format(dt, "yyyy-MM-dd"),
      }),
      replace: true,
    });
  };

  // 3a. On mount: if no date in URL and we're in month view, snap to first-of-month
  // biome-ignore lint/correctness/useExhaustiveDependencies: Run on Mount
  useEffect(() => {
    if (!urlDate && timeframe === "m") {
      const firstOfMonth = alignToPeriodStart("m", new Date());
      setDateState(firstOfMonth);
      updateURL({ date: firstOfMonth });
    }
  }, []); // run once

  // 3b. Public setter: change timeframe
  const setTimeframe = (newTf: Timeframe) => {
    const today = new Date();
    let snapped: Date;

    // If moving from month → week, and our current date is within the current calendar month,
    // snap to the start of THIS week
    if (
      timeframe === "m" &&
      newTf === "w" &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    ) {
      snapped = alignToPeriodStart("w", today);
    } else {
      // otherwise, snap based on whatever our current `date` was
      snapped = alignToPeriodStart(newTf, date);
    }

    setTimeframeState(newTf);
    setDateState(snapped);
    updateURL({ timeframe: newTf, date: snapped });
  };

  // 3c. Public setter: change date directly
  const setDate = (newDate: Date) => {
    setDateState(newDate);
    updateURL({ date: newDate });
  };

  // 4. Sync URL → state if the user hits “back” or manually edits
  // biome-ignore lint/correctness/useExhaustiveDependencies: TBD
  useEffect(() => {
    if (urlTimeframe && urlTimeframe !== timeframe) {
      setTimeframeState(urlTimeframe as Timeframe);
    }
    if (urlDate) {
      const parsed = parse(urlDate, "yyyy-MM-dd", new Date());
      if (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getTime() !== date.getTime()
      ) {
        setDateState(parsed);
      }
    }
  }, [urlTimeframe, urlDate]);

  // 5. Compute the actual range
  const { start, end } = getTimeframeRange(date, timeframe);

  return {
    timeframe,
    date,
    setTimeframe,
    setDate,
    dateRange: {
      start: new Date(start),
      end: new Date(end),
    },
  };
}
