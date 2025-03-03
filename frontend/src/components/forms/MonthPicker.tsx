
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface MonthPickerProps {
  onChange: (months: number[]) => void;
  selectedMonths?: number[];
}

const monthNames = [
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

const MonthPicker: React.FC<MonthPickerProps> = ({ onChange, selectedMonths = [] }) => {
  const [selected, setSelected] = useState<number[]>(selectedMonths);

  const handleMonthClick = (month: number) => {
    const isSelected = selected.includes(month);
    let newSelection: number[];

    if (isSelected) {
      newSelection = selected.filter((m) => m !== month);
    } else {
      newSelection = [...selected, month];
    }

    setSelected(newSelection);
    onChange(newSelection);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {monthNames.map((monthName, index) => (
        <Button
          key={index}
          variant={selected.includes(index) ? "default" : "outline"}
          onClick={(e) => {
            e.preventDefault();
            handleMonthClick(index)
          }}
        >
          {monthName}
        </Button>
      ))}
    </div>
  );
};

export default MonthPicker;

