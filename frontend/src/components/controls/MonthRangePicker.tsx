import { useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have this utility from Shadcn/UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Add Select component from Shadcn/UI

const MonthRangePicker = () => {
  const [range, setRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: undefined,
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleRangeChange = (newRange: { from: Date; to?: Date }) => {
    setRange({
      from: newRange.from,
      to: newRange.to,
    });
    if (newRange.to) {
      setIsOpen(false); // Close popover when range is complete
    }
  };

  const displayText = () => {
    if (!range.from) return "Select month range";
    return range.to
      ? `${format(range.from, "MMM yyyy")} - ${format(range.to, "MMM yyyy")}`
      : format(range.from, "MMM yyyy");
  };

  return (
    <div className="flex flex-col space-y-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal text-sm",
              !range.from && "text-muted-foreground",
              "truncate", // Prevent text overflow
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{displayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <MonthRangeSelector
            selected={range}
            onSelect={handleRangeChange}
          />
        </PopoverContent>
      </Popover>

      <div className="text-sm">
        {range.from && (
          <p>
            Selected: <strong>{format(range.from, "MMMM yyyy")}</strong>
            {range.to ? " to " : ""}
            {range.to && <strong>{format(range.to, "MMMM yyyy")}</strong>}
          </p>
        )}
      </div>
    </div>
  );
};

// New MonthRangeSelector component
interface MonthRangeSelectorProps {
  selected: { from: Date; to: Date | undefined };
  onSelect: (range: { from: Date; to?: Date }) => void;
}

function MonthRangeSelector({ selected, onSelect }: MonthRangeSelectorProps) {
  const [tempFrom, setTempFrom] = useState<Date>(selected.from);
  const [tempTo, setTempTo] = useState<Date | undefined>(selected.to);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i); // Last 5 years + current
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleFromChange = (year: string, month: string) => {
    const newFrom = startOfMonth(
      new Date(parseInt(year), months.indexOf(month)),
    );
    setTempFrom(newFrom);
    if (tempTo && newFrom > tempTo) {
      setTempTo(undefined); // Reset "to" if "from" is after it
    }
  };

  const handleToChange = (year: string, month: string) => {
    const newTo = endOfMonth(new Date(parseInt(year), months.indexOf(month)));
    if (newTo < tempFrom) return; // Prevent "to" being before "from"
    setTempTo(newTo);
  };

  const applyRange = () => {
    onSelect({ from: tempFrom, to: tempTo });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* From Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <div className="flex gap-2">
            <Select
              onValueChange={(month) =>
                handleFromChange(format(tempFrom, "yyyy"), month)}
              defaultValue={format(tempFrom, "MMM")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(year) =>
                handleFromChange(year, format(tempFrom, "MMM"))}
              defaultValue={format(tempFrom, "yyyy")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* To Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To (optional)</label>
          <div className="flex gap-2">
            <Select
              onValueChange={(month) =>
                tempTo && handleToChange(format(tempTo, "yyyy"), month)}
              value={tempTo ? format(tempTo, "MMM") : undefined}
              disabled={!tempFrom}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(year) =>
                tempTo && handleToChange(year, format(tempTo, "MMM"))}
              value={tempTo ? format(tempTo, "yyyy") : undefined}
              disabled={!tempFrom}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={applyRange} className="w-full">
        Apply
      </Button>
    </div>
  );
}

export default MonthRangePicker;
