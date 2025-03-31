import * as betaService from "./beta";
import * as riskMetricsService from "./riskMetrics";
import * as roiService from "./roi";
import * as timeWeightedReturnService from "./timeWeightedReturn";

export const portfolioCalculationService = {
	...roiService,
	...timeWeightedReturnService,
	...riskMetricsService,
	...betaService,
};
