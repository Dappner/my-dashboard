import { useNavigate, useSearch } from "@tanstack/react-router";
import { format, parse } from "date-fns";

export function useMonthParam(defaultMonth = new Date()) {
  // Get the month from search params instead of path params
  const { month } = useSearch({ strict: false });
  const navigate = useNavigate();

  // Parse month from URL if available, or use default
  const selectedDate = month
    ? parse(month, "yyyy-MM", new Date())
    : defaultMonth;

  // Function to update URL when month changes
  const setSelectedDate = (newDate: Date) => {
    const formattedMonth = format(newDate, "yyyy-MM");

    navigate({
      search: (prev) => ({
        ...prev,
        month: formattedMonth,
      }),
      replace: true,
    });
  };

  return { selectedDate, setSelectedDate };
}
