import { useTicker } from "../../hooks/useTickers";
import TickerTable from "./components/TickerTable";

export default function ResearchPage() {
  const {
    tickers,
    isLoading,
  } = useTicker();

  return (
    <>
      <TickerTable isLoading={isLoading} filteredTickers={tickers} />
    </>
  )
}
