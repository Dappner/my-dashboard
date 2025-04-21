import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { investingDashboardRoute } from "@/routes/investing-routes";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  type: "Stock" | "Sector" | "Industry";
}

interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
}

export function WatchlistSidebar() {
  const [selectedWatchlist, setSelectedWatchlist] = useState("1");

  // Mock watchlist data
  const watchlists: Watchlist[] = [
    {
      id: "1",
      name: "Tech Portfolio",
      items: [
        {
          id: "1",
          symbol: "AAPL",
          name: "Apple Inc.",
          exchange: "NASDAQ",
          type: "Stock",
        },
        {
          id: "2",
          symbol: "MSFT",
          name: "Microsoft Corp.",
          exchange: "NASDAQ",
          type: "Stock",
        },
        {
          id: "3",
          symbol: "technology",
          name: "Technology",
          exchange: "",
          type: "Sector",
        },
      ],
    },
    {
      id: "2",
      name: "Energy Picks",
      items: [
        {
          id: "4",
          symbol: "XOM",
          name: "Exxon Mobil Corp.",
          exchange: "NYSE",
          type: "Stock",
        },
        {
          id: "5",
          symbol: "energy",
          name: "Energy",
          exchange: "",
          type: "Sector",
        },
      ],
    },
  ];

  const currentWatchlist = watchlists.find((w) => w.id === selectedWatchlist);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between gap-4 items-center">
        <CardTitle className="text-lg font-semibold text-muted-foreground">
          Watchlist
        </CardTitle>

        <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder="Select watchlist" />
          </SelectTrigger>
          <SelectContent>
            {watchlists.map((watchlist) => (
              <SelectItem key={watchlist.id} value={watchlist.id}>
                {watchlist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentWatchlist && currentWatchlist.items.length > 0 ? (
          <ul className="space-y-3">
            {currentWatchlist.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <Link
                    to={investingDashboardRoute.to}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {item.symbol}
                  </Link>
                  <p className="text-gray-500">{item.name}</p>
                </div>
                <span className="text-gray-400 text-xs">{item.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No items in this watchlist.
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full rounded-full">
          Add to Watchlist
        </Button>
      </CardContent>
    </Card>
  );
}
