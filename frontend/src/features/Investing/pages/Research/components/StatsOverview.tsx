import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BarChart3, DollarSign, PieChart, TrendingUp } from "lucide-react";

export function StatsOverview() {
  const stats = [
    {
      label: "Global Market Cap",
      value: "$TBD",
      description: "Total global cap placeholder",
      icon: <DollarSign className="h-5 w-5 text-blue-500" />,
      link: "/investing/sectors",
    },
    {
      label: "24H Volume",
      value: "$TBD",
      description: "24-hour volume placeholder",
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      link: "/investing/sectors",
    },
    {
      label: "S&P 500",
      value: "TBD pts",
      description: "Index data placeholder",
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      link: "/investing/ticker/NYSE/SPY",
    },
    {
      label: "NASDAQ",
      value: "TBD pts",
      description: "Index data placeholder",
      icon: <PieChart className="h-5 w-5 text-orange-500" />,
      link: "/investing/ticker/NASDAQ/QQQ",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative overflow-hidden ">
          <CardContent className="p-6">
            <Link to={stat.link} className="block">
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
