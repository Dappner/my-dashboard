export const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "TBD";
	const currentDate = new Date();
	const newDate = new Date(dateStr);
	const options: Intl.DateTimeFormatOptions =
		currentDate.getFullYear() !== newDate.getFullYear()
			? { month: "short", day: "numeric", year: "numeric" }
			: { month: "short", day: "numeric" };
	return new Date(dateStr).toLocaleDateString("en-US", options);
};

export const formatLargeNumber = (number?: number | null): string => {
	if (!number) return "N/A";
	if (number >= 1e12) return `$${(number / 1e12).toFixed(2)}T`;
	if (number >= 1e9) return `$${(number / 1e9).toFixed(2)}B`;
	if (number >= 1e6) return `$${(number / 1e6).toFixed(2)}M`;
	return `$${number.toLocaleString()}`;
};

export const formatPercent = (value?: number | null): string => {
	if (!value) return "N/A";

	return `${value.toFixed(2)}%`;
};

export function formatSectorName(name?: string | null, nullSub?: string) {
	switch (name) {
		case null:
			return "-";
		case "":
			return "-";
		case "technology":
			return "Technology";
		case "energy":
			return "Energy";
		case "healthcare":
			return "Healthcare";
		case "industrials":
			return "Industrials";
		case "realestate":
			return "Real Estate";
		case "utilities":
			return "Utilities";
		case "communication-services":
			return "Communication Services";
		case "consumer-cyclical":
			return "Consumer Cyclical";
		case "financial-services":
			return "Financial Services";
		case "basic-materials":
			return "Basic Materials";
		case "consumer-defensive":
			return "Consumer Defensive";
		default:
			return nullSub ? nullSub : name;
	}
}

export function formatIndustryName(name?: string | null, nullSub?: string) {
	if (!name) return nullSub ? nullSub : "-";

	const replaced = name.replace(/-/g, " ");
	const capitalized = replaced.replace(/\b\w/g, (match) => match.toUpperCase());

	return capitalized;
}

export function formatCategoryName(name?: string | null, nullSub?: string) {
	if (!name) return nullSub ? nullSub : "-";

	const replaced = name.replace(/-/g, " ");
	const capitalized = replaced.replace(/\b\w/g, (match) => match.toUpperCase());

	return capitalized;
}

export const formatCurrency = (value?: number): string => {
	if (!value) return "0";

	return `$${value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
};
