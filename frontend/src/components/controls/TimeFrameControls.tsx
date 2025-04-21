import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { timeframes } from "@/constants";
import { cn } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";

export interface TimeframeControlsProps {
  className?: string;
  timeframe: Timeframe;
  onTimeframeChange: (period: Timeframe) => void;
}
export default function TimeframeControls({
  className,
  timeframe,
  onTimeframeChange,
}: TimeframeControlsProps) {
  const handleValueChange = (value: string) => {
    if (
      value &&
      value !== timeframe &&
      timeframes.includes(value as Timeframe)
    ) {
      onTimeframeChange(value as Timeframe);
    }
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={timeframe}
      onValueChange={handleValueChange}
      className={cn(
        className,
        "flex flex-wrap justify-center dark:bg-sidebar shadow-xs",
      )}
      aria-label="Select time frame"
    >
      {timeframes.map((period) => (
        <ToggleGroupItem
          key={period}
          value={period}
          aria-label={`Select ${period} timeframe`}
          className={cn(
            "px-4 sm:px-3 cursor-pointer",
            "data-[state=on]:bg-sidebar-primary/10 data-[state=on]:text-sidebar-primary",
          )}
        >
          {period}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
