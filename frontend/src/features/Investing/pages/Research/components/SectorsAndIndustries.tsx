import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectorsWithIndustries } from "@/features/Investing/hooks/useSectorsWithIndustries";
import { formatCurrency } from "@/lib/formatting";
import {
  investingIndustryRoute,
  investingResearchRoute,
  investingSectorRoute,
} from "@/routes/investing-routes";
import type { SectorWithIndustries } from "@my-dashboard/shared";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Building2 } from "lucide-react";
import { useMemo } from "react";

export function SectorsAndIndustries() {
  const {
    sectors,
    isLoading: isLoadingSectors,
    isError: isErrorSectors,
    refetch,
  } = useSectorsWithIndustries();

  const sortedSectors = useMemo(() => {
    return [...sectors].sort(
      (a, b) => (b.market_cap || 0) - (a.market_cap || 0)
    );
  }, [sectors]);

  if (isLoadingSectors) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-72 w-full rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isErrorSectors) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Failed to Load Sectors</AlertTitle>
        <AlertDescription>
          We couldn’t retrieve sector data. Please try again.
          <Button
            variant="link"
            className="p-0 ml-2 text-red-700 hover:underline"
            onClick={() => refetch()}
            aria-label="Retry loading sectors"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (sortedSectors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl border border-gray-100">
        <Building2 className="h-14 w-14 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">
          No Sectors Available
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          It looks like there are no sectors to display at the moment. Check
          back later or explore other market insights.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 rounded-full hover:bg-blue-50"
        >
          <Link
            to={investingResearchRoute.to}
            aria-label="Go to market overview"
          >
            Explore Market
          </Link>
        </Button>
      </div>
    );
  }

  return (
    // Wrapping sectors in a horizontal scroll container (carousel)
    <div className="relative">
      <div className="flex space-x-6 overflow-x-auto pb-4 px-2 scrollbar-hide">
        {sortedSectors.map((sector: SectorWithIndustries) => {
          // Limit industries to the top 3 sorted by companies_count (largest first)
          const industries =
            Array.isArray(sector.industries) && sector.industries.length > 0
              ? [...sector.industries]
                  .sort(
                    (a, b) =>
                      (b.companies_count || 0) - (a.companies_count || 0)
                  )
                  .slice(0, 3)
              : [];

          return (
            <Card
              key={sector.id}
              className="min-w-[300px] overflow-hidden group rounded-xl"
              aria-labelledby={`sector-${sector.id}`}
            >
              <CardHeader className="pb-3 pt-2">
                {/* Reduced top padding */}
                <CardTitle
                  id={`sector-${sector.id}`}
                  className="text-xl font-semibold text-gray-900"
                >
                  {sector.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sector.companies_count && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 text-xs"
                    >
                      {sector.companies_count} Companies
                    </Badge>
                  )}
                  {sector.market_cap && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      {formatCurrency(sector.market_cap, true)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {industries.length > 0 ? (
                  <ul className="space-y-2">
                    {industries.map((industry) => (
                      <li key={industry.id}>
                        <Link
                          to={investingIndustryRoute.to}
                          params={{ industrySlug: industry.key }}
                          className="flex justify-between items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                          aria-label={`View ${industry.name} industry details`}
                        >
                          <span>{industry.name}</span>
                          {industry.companies_count && (
                            <span className="text-gray-500 text-xs">
                              {industry.companies_count}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No industries listed for this sector.
                  </p>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full bg-white hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border-gray-200"
                  aria-label={`View details for ${sector.name} sector`}
                >
                  <Link
                    to={investingSectorRoute.to}
                    params={{ sectorSlug: sector.key }}
                  >
                    Explore Sector
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
