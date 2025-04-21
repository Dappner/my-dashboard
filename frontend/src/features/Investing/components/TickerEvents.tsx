import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { CalendarEventsView } from "@my-dashboard/shared";
import { ArrowUpRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerEventsProps {
  events?: CalendarEventsView[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  tickerSymbol?: string;
}

export default function TickerEvents({
  events,
  isLoading,
  isError,
  error,
  tickerSymbol,
}: TickerEventsProps) {
  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            {error || "Failed to load events"}
          </p>
        ) : events?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tickerSymbol
              ? `No upcoming events for ${tickerSymbol}`
              : "No upcoming events"}
          </p>
        ) : (
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div
                  className={cn(
                    "p-2 rounded",
                    event.event_type === "earnings"
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "bg-accent/30 dark:bg-accent/40",
                  )}
                >
                  {event.event_type === "earnings" ? (
                    <ArrowUpRight className="h-5 w-5 text-primary dark:text-primary-foreground" />
                  ) : (
                    <Calendar className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {event.event_type === "dividend"
                      ? "Dividend Payment"
                      : event.event_type === "ex_dividend"
                        ? "Ex-Dividend Date"
                        : "Earnings Report"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.date)}
                    {!tickerSymbol && event.ticker_symbol
                      ? ` • ${event.ticker_symbol}${event.ticker_exchange
                        ? ` (${event.ticker_exchange})`
                        : ""
                      }`
                      : ""}
                    {event.event_type === "dividend" && event.revenue_average
                      ? ` • $${(event.revenue_average / 1000000).toFixed(2)}M`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
