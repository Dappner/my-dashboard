import { timeframes } from "@/constants";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { Button } from "@/components/ui/button";


export default function TimeframeControls({ timeframe, onTimeframeChange, onChartTypeChange }: {
  timeframe: Timeframe;
  onTimeframeChange: (period: Timeframe) => void;
}) {
  return (
    <div className="flex gap-2">
      {timeframes.map((period) => (
        <Button
          key={period}
          variant={timeframe === period ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeframeChange(period)}
        >
          {period}
        </Button>
      ))}
    </div>
  );
} 
