
import * as roiService from './roi';
import * as timeWeightedReturnService from './timeWeightedReturn';
import * as riskMetricsService from './riskMetrics';
import * as betaService from './beta';

export const portfolioCalculationService = {
  ...roiService,
  ...timeWeightedReturnService,
  ...riskMetricsService,
  ...betaService,
};
