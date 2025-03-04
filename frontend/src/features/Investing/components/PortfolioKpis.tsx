import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Portfolio } from "@/types/portfolioTypes";
import { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

interface PortfolioKpisProps {
  portfolio?: Portfolio;
}
export default function PortfolioKpis({ portfolio }: PortfolioKpisProps) {

  const { data: dailyMetrics, isLoading, isError } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as Database["public"]["Views"]["portfolio_daily_metrics"]["Row"][];
    },
    queryKey: ["30Day"]
  });

  const portfolio_value = dailyMetrics![dailyMetrics!.length - 1].portfolio_value;
  const portfolio_cost_basis = dailyMetrics![dailyMetrics!.length - 1].cost_basis;

  if (isLoading) return <></>


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Market Value</CardTitle>
          <h3>${portfolio_value}</h3>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Cash Balance</CardTitle>
          <h3>${portfolio?.cash}</h3>
        </CardHeader>
      </Card>

    </>
  )
}
