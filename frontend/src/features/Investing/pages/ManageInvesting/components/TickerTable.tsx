import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TickerForm,
  TickerFormValues,
} from "@/features/Investing/forms/TickerForm";
import { Ticker } from "@/types/tickerTypes";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { monthsShort } from "@/features/Investing/constants";
import { useNavigate } from "react-router";

interface TickerTableProps {
  filteredTickers: Ticker[];
  onEditTicker: (ticker: Ticker) => void;
  onDeleteTicker: (tickerId: string) => void;
  editingTicker: Ticker | null;
  isUpdating: boolean;
  handleSubmitTicker: (values: TickerFormValues) => void;
  handleCloseEditSheet: () => void;
}

export default function TickerTable({
  filteredTickers,
  onEditTicker,
  onDeleteTicker,
  editingTicker,
  isUpdating,
  handleSubmitTicker,
  handleCloseEditSheet,
}: TickerTableProps) {
  const navigate = useNavigate();

  const onSymbolClick = (ticker: Ticker) => {
    navigate(`/investing/stock/${ticker.exchange}/${ticker.symbol}`)
  }

  return (
    <>
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickers.map((ticker) => (
            <TableRow key={ticker.id}>
              <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => onSymbolClick(ticker)}>{ticker.symbol}</TableCell>
              <TableCell>{ticker.name || "-"}</TableCell>
              <TableCell>{ticker.exchange || "-"}</TableCell>
              <TableCell>{ticker.sector || "-"}</TableCell>
              <TableCell>{ticker.industry || "-"}</TableCell>
              <TableCell>{ticker.dividend_amount || "-"}</TableCell>
              <TableCell>{ticker.dividend_months?.map((val) => monthsShort[val]).join(",")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Sheet
                    open={editingTicker?.id === ticker.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        handleCloseEditSheet();
                      }
                    }}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTicker(ticker)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Ticker</SheetTitle>
                        <SheetDescription>
                          Update the details for {ticker.symbol}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4">
                        {editingTicker?.id === ticker.id && (
                          <TickerForm
                            defaultValues={{
                              symbol: editingTicker.symbol,
                              name: editingTicker.name || "",
                              exchange: editingTicker.exchange || "",
                              sector: editingTicker.sector || "",
                              industry: editingTicker.industry || "",
                              dividend_amount: editingTicker.dividend_amount || undefined,
                              dividend_months: editingTicker.dividend_months || [],
                              cik: editingTicker.cik || ""
                            }}
                            onSubmit={handleSubmitTicker}
                            onCancel={handleCloseEditSheet}
                            isSubmitting={isUpdating}
                            isEditing={true}
                          />
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTicker(ticker.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

