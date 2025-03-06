import { Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarEventsView } from "@/types/calendarEventsTypes";
import { formatDate } from "@/lib/formatting";

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
    <>
      <div className="flex flex-row items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading events...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">{error || "Failed to load events"}</p>
          ) : events!.length === 0 ? (
            <p className="text-sm text-gray-500">
              {tickerSymbol ? `No upcoming events for ${tickerSymbol}` : "No upcoming events"}
            </p>
          ) : (
            <div className="space-y-4">
              {events!.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded ${event.event_type === "earnings" ? "bg-purple-100" : "bg-blue-100"
                      }`}
                  >
                    {event.event_type === "earnings" ? (
                      <ArrowUpRight className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Calendar className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {event.event_type === "dividend"
                        ? "Dividend Payment"
                        : event.event_type === "ex_dividend"
                          ? "Ex-Dividend Date"
                          : "Earnings Report"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.date)}
                      {!tickerSymbol && event.ticker_symbol
                        ? ` • ${event.ticker_symbol}${event.ticker_exchange ? ` (${event.ticker_exchange})` : ""}`
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
    </>
  );
}
