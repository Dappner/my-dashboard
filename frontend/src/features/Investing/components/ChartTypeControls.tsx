import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ChartType = "absolute" | "percentual";

export default function ChartTypeControls({ chartType, onChartTypeChange }: {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}) {
  const handleValueChange = (value: string) => {
    if (value === "absolute" || value === "percentual") {
      onChartTypeChange(value);
    }
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={chartType}
      onValueChange={handleValueChange}
      aria-label="Chart value type"
      className="bg-white shadow-xs"
    >
      <ToggleGroupItem
        value="absolute"
        aria-label="Show absolute values"
        className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 px-3 cursor-pointer"
      >
        Value
      </ToggleGroupItem>
      <ToggleGroupItem
        value="percentual"
        aria-label="Show percentage values"
        className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 px-3 cursor-pointer"
      >
        %
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
