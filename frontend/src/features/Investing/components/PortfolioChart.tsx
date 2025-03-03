import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns";
import { Database } from "@/types/supabase"

const chartConfig = {
  portfolioValue: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  costBasis: {
    label: "Cost Basis",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig

export function PortfolioChart() {
  const { data, isLoading, isError } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as Database["public"]["Views"]["portfolio_daily_metrics"]["Row"][];
    },
    queryKey: ["30Day"]
  })

  if (isLoading) return <></>;

  if (isError) return <> Whoops an Error Occurred</>

  const chartData = data?.map((val) => {
    return {
      date: new Date(val.current_date!),
      cost_basis: val.cost_basis,
      portfolio_value: val.portfolio_value
    }
  })


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between">
          <CardTitle>Portfolio</CardTitle>
        </div>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: Date) => format(value, "MMM d")}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Line
              dataKey="cost_basis"
              type="monotone"
              strokeWidth={2}
              stroke="#808080"
            />
            <Line
              dataKey="portfolio_value"
              type="monotone"
              stroke="#2563eb"
              strokeWidth={2}
            />

          </LineChart>
        </ChartContainer>
      </CardContent >
    </Card >
  )
}

export default PortfolioChart;
