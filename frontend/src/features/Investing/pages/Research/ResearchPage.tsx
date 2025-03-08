import { useQuery } from "@tanstack/react-query";
import TickerTable from "./components/TickerTable";
import { supabase } from "@/lib/supabase";

export default function ResearchPage() {
  const {
    data: tickers,
    isLoading,
  } = useQuery({
    queryKey: ["tickerdailyview"],
    queryFn: async () => {
      const { data } = await supabase.from("ticker_daily_view").select()

      return data;
    }
  })

  return (
    <>
      <TickerTable isLoading={isLoading} filteredTickers={tickers} />
    </>
  )
}
