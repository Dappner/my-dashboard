import { createPortfolioCalculationService } from "./portfolioCalculationService";

export function createServices() {
  return {
    portfolioCalculation: createPortfolioCalculationService(),
  };
}

export type Services = ReturnType<typeof createServices>;

export * from "./portfolioCalculationService";
