import { Api } from "@/api";
import { createPortfolioCalculationService } from "./portfolioCalculationService";

export function createServices(api: Api) {
  return {
    portfolioCalculation: createPortfolioCalculationService(),
  };
}

export type Services = ReturnType<typeof createServices>;

// Re-export services
export * from "./portfolioCalculationService";
