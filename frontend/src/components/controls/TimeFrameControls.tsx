import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { timeframes } from "@/constants";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";

export default function TimeframeControls({
  timeframe,
  onTimeframeChange,
}: {
  timeframe: Timeframe;
  onTimeframeChange: (period: Timeframe) => void;
}) {
  // Handler ensures only valid Timeframe values are passed up
  const handleValueChange = (value: string) => {
    // Check if the selected value is a valid timeframe and actually changed
    if (
      value && value !== timeframe && timeframes.includes(value as Timeframe)
    ) {
      onTimeframeChange(value as Timeframe);
    }
    // If value is empty (clicked active item), do nothing to prevent deselection
  };

  return (
    <ToggleGroup
      type="single"
      // variant="outline" // You might prefer no outline for closer match
      size="sm" // Small size for density
      value={timeframe}
      onValueChange={handleValueChange}
      className="flex flex-wrap justify-center" // Allow wrapping and center items
      aria-label="Select time frame"
    >
      {timeframes.map((period) => (
        <ToggleGroupItem
          key={period}
          value={period}
          aria-label={`Select ${period} timeframe`}
          // Add custom styling for a closer match to the screenshot if needed
          // e.g., className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 px-3"
          className="px-3" // Adjust padding as needed
        >
          {period}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
