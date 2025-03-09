import logging
import sys
from config import SUPABASE_URL, SUPABASE_KEY
from supabase_client import SupabaseClient
from ticker_fetcher import TickerFetcher
from ticker_processor import TickerProcessor

logger = logging.getLogger()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("daily-market-update")


def lambda_handler(event, context):
    logger.info("Starting Lambda execution", extra={"event": event})
    try:
        supabase_client = SupabaseClient(SUPABASE_URL, SUPABASE_KEY).get_client()
        ticker_fetcher = TickerFetcher(supabase_client)
        ticker_processor = TickerProcessor(supabase_client)

        tickers = ticker_fetcher.fetch_tickers()
        if not tickers:
            logger.warning("No tickers found in Supabase")
            return {"statusCode": 400, "body": "No tickers found"}

        updates_by_ticker = {}
        for ticker in tickers:
            symbol = ticker["symbol"]
            try:
                updates = ticker_processor.process_ticker(ticker)
                updates_by_ticker[symbol] = list(
                    updates
                )  # Convert set to list for JSON serialization
            except Exception as e:
                logger.error(f"Error processing {ticker['symbol']}: {e}")
                updates_by_ticker[symbol] = ["error"]

        total_updates = sum(len(tables) for tables in updates_by_ticker.values())

        summary_lines = []
        for symbol, updates in updates_by_ticker.items():
            if "error" in updates:
                summary_lines.append(f"{symbol}: Failed to process due to error")
            elif updates:
                summary_lines.append(f"{symbol}: Updated tables - {', '.join(updates)}")
            else:
                summary_lines.append(f"{symbol}: No updates performed")

        summary_text = "\n".join(summary_lines)
        logger.info(
            f"Completed processing {len(tickers)} tickers",
            extra={
                "total_updates": total_updates,
                "tickers_processed": len(tickers),
                "summary": summary_text,
            },
        )

        response_body = (
            f"Processed {len(tickers)} tickers, updated {total_updates} table entries\n"
            f"Detailed Updates:\n{summary_text}"
        )

        return {
            "statusCode": 200,
            "body": response_body,
        }
    except Exception as e:
        logger.error(f"Global error: {e}")
        return {"statusCode": 500, "body": f"Internal Server Error: {str(e)}"}


if __name__ == "__main__":
    result = lambda_handler(None, None)
    print(result["body"])
