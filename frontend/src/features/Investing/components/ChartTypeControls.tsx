import { Button } from "@/components/ui/button";


type ChartType = "absolute" | "percentual";


export default function ChartTypeControls({ chartType, onChartTypeChange }: {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}) {


  return (
    <>
      <div className="flex gap-2">
        <Button
          variant={chartType === "absolute" ? "default" : "outline"}
          size="sm"
          onClick={() => onChartTypeChange("absolute")}
        >
          Absolute
        </Button>
        <Button
          variant={chartType === "percentual" ? "default" : "outline"}
          size="sm"
          onClick={() => onChartTypeChange("percentual")}
        >
          Percent
        </Button>
      </div>

    </>
  )
}
