import { useQuery } from "@tanstack/react-query";
import TickerTable from "./components/TickerTable";
import { supabase } from "@/lib/supabase";
import { PageContainer } from "@/components/layout/components/PageContainer";

export default function ResearchPage() {
  const {
    data: tickers,
    isLoading,
  } = useQuery({
    queryKey: ["tickerdailyview"],
    queryFn: async () => {
      const { data } = await supabase.from("ticker_daily_view").select();

      return data;
    },
  });
  console.log(tickers);

  return (
    <PageContainer>
      <TickerTable isLoading={isLoading} filteredTickers={tickers} />
    </PageContainer>
  );
}
