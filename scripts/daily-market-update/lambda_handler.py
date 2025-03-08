import logging
from config import SUPABASE_URL, SUPABASE_KEY
from supabase_client import SupabaseClient
from ticker_fetcher import TickerFetcher
from ticker_processor import TickerProcessor

logger = logging.getLogger()

logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)


def lambda_handler(event, context):
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
            try:
                updates = ticker_processor.process_ticker(ticker)
                updates_by_ticker[ticker["symbol"]] = updates
            except Exception as e:
                logger.error(f"Error processing {ticker['symbol']}: {e}")
                continue

        total_updates = sum(len(tables) for tables in updates_by_ticker.values())
        logger.info(
            f"Completed processing {len(tickers)} tickers with {total_updates} updates"
        )
        return {
            "statusCode": 200,
            "body": f"Processed {len(tickers)} tickers, updated {total_updates} table entries",
        }
    except Exception as e:
        logger.error(f"Global error: {e}")
        return {"statusCode": 500, "body": f"Internal Server Error: {str(e)}"}


if __name__ == "__main__":
    result = lambda_handler(None, None)
    print(result)
