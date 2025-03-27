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
      type="single" // Ensures only one item can be selected
      variant="outline" // Gives the group a nice outline style
      size="sm" // Makes the buttons small
      value={chartType} // The currently selected value
      onValueChange={handleValueChange} // Function to call when selection changes
      aria-label="Chart value type" // Accessibility label for the group
    >
      <ToggleGroupItem
        value="absolute"
        aria-label="Show absolute values" // Accessibility label
        className="p-4"
      >
        Value
      </ToggleGroupItem>
      <ToggleGroupItem
        value="percentual"
        aria-label="Show percentage values" // Accessibility label
        className="p-4"
      >
        %
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
