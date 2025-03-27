import { timeframes } from "@/constants";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function TimeframeControls({ timeframe, onTimeframeChange }: {
  timeframe: Timeframe;
  onTimeframeChange: (period: Timeframe) => void;
}) {
  return (
    <div>
      {/* Desktop View: Row of Buttons (Hidden below 'md' breakpoint) */}
      <div className="hidden md:flex md:gap-2">
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

      {/* Mobile View: Dropdown Button (Visible below 'md' breakpoint) */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Button that shows the currently selected timeframe */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              {timeframe}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Align dropdown to the right */}
            {timeframes.map((period) => (
              <DropdownMenuItem
                key={period}
                // Optional: Add visual indication for the selected item in the dropdown
                className={timeframe === period ? "bg-accent" : ""}
                onClick={() => onTimeframeChange(period)}
              // Prevent closing dropdown immediately if needed, though usually desired
              // onSelect={(event) => event.preventDefault()}
              >
                {period}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
