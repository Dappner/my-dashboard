import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircleIcon } from "lucide-react";

export default function RiskTab() {

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircleIcon className="mr-2 h-5 w-5" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Portfolio volatility and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Portfolio Beta</span>
                  <span className="text-sm">1.2</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">Higher than market volatility</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sharpe Ratio</span>
                  <span className="text-sm">1.8</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">Good risk-adjusted returns</p>
              </div>

              <Alert variant="default" className="mt-4">
                <AlertTitle>Risk Report</AlertTitle>
                <AlertDescription className="text-xs">
                  Your portfolio shows moderate risk levels with good potential for returns.
                  Consider diversifying into more defensive sectors.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Diversification Analysis</CardTitle>
            <CardDescription>Concentration and correlation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Position Concentration</h3>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Top holding</span>
                    <span className="font-medium">ASML - 35.4%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Top 3 holdings</span>
                    <span className="font-medium">86.3%</span>
                  </div>
                  <Progress value={86.3} className="h-1.5 mt-1" />
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  High concentration risk detected
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Sector Diversification</h3>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Sectors represented</span>
                    <span className="font-medium">3 of 11</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Top sector</span>
                    <span className="font-medium">Technology - 45%</span>
                  </div>
                  <Progress value={45} className="h-1.5 mt-1" />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Consider adding defensive sectors
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Correlation Analysis</h3>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Average correlation</span>
                    <span className="font-medium">0.65</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Correlation to S&P 500</span>
                    <span className="font-medium">0.82</span>
                  </div>
                  <Progress value={82} className="h-1.5 mt-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  High market correlation
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Diversification Score</h3>
                <div className="flex items-center justify-center h-16">
                  <div className="text-center">
                    <span className="text-3xl font-bold">C-</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Needs improvement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
