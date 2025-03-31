/**
 * Calculates Beta, a measure of an investment's volatility relative to the market.
 *
 * Beta is calculated using the covariance of the investment's returns and the market's
 * returns, divided by the variance of the market's returns.
 *
 * $$ Beta = \frac{Covariance(Investment Returns, Market Returns)}{Variance(Market Returns)} $$
 *
 * @param investmentReturns An array of investment returns over a period.
 * @param marketReturns An array of market returns over the same period.
 * @returns The Beta of the investment.
 */
export const calculateBeta = (
	investmentReturns: number[],
	marketReturns: number[],
): number => {
	if (
		investmentReturns.length !== marketReturns.length ||
		investmentReturns.length < 2
	) {
		return 0; // Ensure there are enough data points and equal lengths
	}

	const investmentMean =
		investmentReturns.reduce((a, b) => a + b, 0) / investmentReturns.length;
	const marketMean =
		marketReturns.reduce((a, b) => a + b, 0) / marketReturns.length;

	let covariance = 0;
	for (let i = 0; i < investmentReturns.length; i++) {
		covariance +=
			(investmentReturns[i] - investmentMean) * (marketReturns[i] - marketMean);
	}
	covariance /= investmentReturns.length;

	let marketVariance = 0;
	for (let i = 0; i < marketReturns.length; i++) {
		marketVariance += (marketReturns[i] - marketMean) ** 2;
	}
	marketVariance /= marketReturns.length;

	if (marketVariance === 0) {
		return 0; // Avoid division by zero
	}

	return covariance / marketVariance;
};
