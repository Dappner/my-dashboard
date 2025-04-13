import { PageContainer } from "@/components/layout/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MarketPage() {
  // Market data
  const marketOverview = [
    { label: "S&P 500", value: "4,500", change: "+1.2%", changePositive: true },
    {
      label: "Dow Jones",
      value: "35,000",
      change: "+0.8%",
      changePositive: true,
    },
    { label: "NASDAQ", value: "15,000", change: "+1.5%", changePositive: true },
  ];

  // News stories
  const newsStories = [
    {
      id: 1,
      title: "Tech Stocks Rally",
      summary:
        "Major tech companies saw a surge in share prices today as market sentiment improved.",
    },
    {
      id: 2,
      title: "Economic Recovery Continues",
      summary:
        "Recent data shows ongoing momentum in the economic recovery, with consumer confidence on the rise.",
    },
    {
      id: 3,
      title: "Oil Prices Dip",
      summary:
        "Crude oil prices dipped amidst global market uncertainties, signaling potential shifts in energy markets.",
    },
  ];

  // Sector heatmap data
  const sectorHeatmap = [
    {
      sector: "technology",
      displayName: "Technology",
      performance: "+2.4%",
      positive: true,
    },
    {
      sector: "energy",
      displayName: "Energy",
      performance: "-1.1%",
      positive: false,
    },
    {
      sector: "healthcare",
      displayName: "Healthcare",
      performance: "+0.8%",
      positive: true,
    },
    {
      sector: "financial-services",
      displayName: "Financials",
      performance: "+0.3%",
      positive: true,
    },
    {
      sector: "industrials",
      displayName: "Industrials",
      performance: "-0.9%",
      positive: false,
    },
    {
      sector: "consumer-cyclical",
      displayName: "Consumer Cyclical",
      performance: "+1.7%",
      positive: true,
    },
    {
      sector: "utilities",
      displayName: "Utilities",
      performance: "+0.5%",
      positive: true,
    },
    {
      sector: "real-estate",
      displayName: "Real Estate",
      performance: "-0.2%",
      positive: false,
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Market Overview Section */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {marketOverview.map((item) => (
              <Card key={item.label} className="shadow-sm">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-base font-medium">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-3">
                  <div className="text-xl font-bold">{item.value}</div>
                  <div
                    className={`text-sm ${
                      item.changePositive ? "text-green-600" : "text-red-600"
                    } font-medium`}
                  >
                    {item.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Sector Heatmap Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">Sector Performance</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {sectorHeatmap.map((sector) => (
                <Link
                  to={`/investing/sector/${sector.sector}`}
                  key={sector.sector}
                  className={`p-3 rounded text-center transition-colors hover:opacity-90 ${
                    sector.positive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div className="font-medium">{sector.displayName}</div>
                  <div className="text-sm mt-1">{sector.performance}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Market News Section */}
          <section>
            <h2 className="text-2xl font-bold mb-3">Market News</h2>
            <div className="grid grid-cols-1 gap-3">
              {newsStories.map((news) => (
                <Card key={news.id} className="shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-base font-medium">
                      {news.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-sm text-gray-700">{news.summary}</p>
                  </CardContent>
                  <div className="px-3 pb-3">
                    <Button variant="outline" size="sm" className="w-full">
                      Read More
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
