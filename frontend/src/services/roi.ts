/**
 * Calculates the Return on Investment (ROI).
 *
 * $$ ROI = \frac{(Current Value - Initial Investment)}{Initial Investment} * 100 $$
 *
 * @param currentValue The current value of the investment.
 * @param initialInvestment The initial investment amount.
 * @returns The ROI as a percentage.
 */
export const calculateROI = (
	currentValue: number,
	initialInvestment: number,
): number => {
	if (initialInvestment === 0) {
		return 0; // Avoid division by zero
	}
	return ((currentValue - initialInvestment) / initialInvestment) * 100;
};

/**
 * Calculates the annualized Return on Investment (ROI).
 *
 * $$ Annualized ROI = (1 + ROI)^{\frac{1}{n}} - 1 $$
 *
 * Where n is the number of years.
 *
 * @param currentValue The current value of the investment.
 * @param initialInvestment The initial investment amount.
 * @param years The number of years the investment has been held.
 * @returns The annualized ROI as a percentage.
 */
export const calculateAnnualizedROI = (
	currentValue: number,
	initialInvestment: number,
	years: number,
): number => {
	if (initialInvestment === 0 || years === 0) {
		return 0; // Avoid division by zero
	}
	const roi = calculateROI(currentValue, initialInvestment) / 100;
	return (Math.pow(1 + roi, 1 / years) - 1) * 100;
};
