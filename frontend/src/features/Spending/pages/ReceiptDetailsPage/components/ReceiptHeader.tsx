import type { ReceiptWithItems } from "@/api/receiptsApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, TrashIcon } from "lucide-react";

interface ReceiptHeaderProps {
  receipt: ReceiptWithItems;
  formattedDate: string;
  onDateChange: (date: Date | undefined) => void;
  onDelete: () => void;
  className?: string;
}

export default function ReceiptHeader({
  receipt,
  formattedDate,
  onDateChange,
  onDelete,
  className,
}: ReceiptHeaderProps) {
  return (
    <header className={className}>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold truncate max-w-[50%]">
          {receipt.store_name || "Receipt Details"}
        </h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={receipt.purchase_date}
                onSelect={onDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
