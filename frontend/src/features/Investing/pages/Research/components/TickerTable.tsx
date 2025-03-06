import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticker } from "@/types/tickerTypes";
import { monthsShort } from "@/features/Investing/constants";
import { useNavigate } from "react-router";
import { TableLoading } from "./TableLoading";

interface TickerTableProps {
  filteredTickers?: Ticker[] | null;
  isLoading: boolean;
}

export default function TickerTable({
  filteredTickers,
  isLoading,
}: TickerTableProps) {
  const navigate = useNavigate();
  const onSymbolClick = (ticker: Ticker) => {
    navigate(`/investing/stock/${ticker.exchange}/${ticker.symbol}`);
  };

  return (
    <TableLoading isLoaded={!isLoading} className="h-64">
      <div className="w-full border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Exchange</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Div Amount</TableHead>
              <TableHead>Div Months</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickers?.map((ticker) => (
              <TableRow key={ticker.id}>
                <TableCell
                  className="font-bold cursor-pointer hover:underline"
                  onClick={() => onSymbolClick(ticker)}
                >
                  {ticker.symbol}
                </TableCell>
                <TableCell>{ticker.name || "-"}</TableCell>
                <TableCell>{ticker.exchange || "-"}</TableCell>
                <TableCell>{ticker.sector || "-"}</TableCell>
                <TableCell>{ticker.industry || "-"}</TableCell>
                <TableCell>${ticker.dividend_amount?.toFixed(2) || "-"}</TableCell>
                <TableCell>
                  {ticker.dividend_months?.length == 12
                    ? "Monthly"
                    : ticker.dividend_months?.map((val) => monthsShort[val]).join(",")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TableLoading>
  );
}
