import * as betaService from "./components/beta";
import * as riskMetricsService from "./components/riskMetrics";
import * as roiService from "./components/roi";
import * as timeWeightedReturnService from "./components/timeWeightedReturn";
import * as portfolioMetricsService from "./components/portfolioMetrics";

export function createPortfolioCalculationService() {
  return {
    ...roiService,
    ...timeWeightedReturnService,
    ...portfolioMetricsService,
    ...riskMetricsService,
    ...betaService,
  };
}
