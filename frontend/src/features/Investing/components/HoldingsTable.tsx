import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Holding } from "@/types/holdingsTypes"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

export default function HoldingsTable() {
  const navigate = useNavigate();
  const { data: holdings, isLoading, isError } = useQuery({
    queryFn: holdingsApi.getHoldings,
    queryKey: holdingsApiKeys.all
  })

  const handleHoldingClick = (holding: Holding) => {
    navigate(`/investing/stock/${holding.exchange}/${holding.symbol}`)
  }

  return (
    <div className="w-full">
      {
        isLoading ? (
          <div className="text-center py-4" > Loading Holdings...</div>
        ) : isError ? (
          <div className="text-center py-4">Error Loading Holdings. Please Refresh the page.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                holdings?.map((holding) => (
                  <TableRow key={holding.ticker_id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleHoldingClick(holding)}>
                    <TableCell>{holding.symbol}</TableCell>
                    <TableCell>{holding.shares?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(holding.average_cost_basis! * holding.shares!).toFixed(2)}</TableCell>
                    <TableCell>{holding.current_market_value?.toFixed(2)}</TableCell>
                    <TableCell>{holding.unrealized_gain_loss?.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>)
      }
    </div>
  )
}
