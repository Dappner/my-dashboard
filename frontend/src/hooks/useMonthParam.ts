import { format, parse } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

export function useMonthParam(defaultMonth = new Date()) {
	const { month } = useParams<{ month?: string }>();
	const navigate = useNavigate();

	// Parse month from URL if available, or use default
	const selectedDate = month
		? parse(month, "yyyy-MM", new Date())
		: defaultMonth;

	// Function to update URL when month changes
	const setSelectedDate = (newDate: Date) => {
		const formattedMonth = format(newDate, "yyyy-MM");

		// Get the current path without the month parameter
		const pathParts = window.location.pathname.split("/");
		const basePathParts = pathParts.filter(
			(part) => !part.match(/^\d{4}-\d{2}$/),
		);

		// Build the new path with the month parameter
		const newPath = [...basePathParts, formattedMonth].join("/");

		navigate(newPath);
	};

	return { selectedDate, setSelectedDate };
}
