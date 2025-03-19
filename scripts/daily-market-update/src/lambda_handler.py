from typing import Dict, List
from pydantic import BaseModel
from src.core.config import SUPABASE_URL, SUPABASE_KEY
from src.core.supabase_client import SupabaseClient
from src.services.ticker_fetcher import TickerFetcher
from src.services.ticker_processor import TickerProcessor
from src.core.logging_config import setup_logging

logger = setup_logging(name="ticker_processor")


class ProcessingResult(BaseModel):
    ticker_count: int
    successful: List[str]
    failed: Dict[str, str]
    updated_tables: Dict[str, List[str]]


def initialize_components() -> tuple:
    """Initialize dependencies with error handling."""
    try:
        supabase = SupabaseClient(SUPABASE_URL, SUPABASE_KEY).get_client()
        return TickerFetcher(supabase), TickerProcessor(supabase)
    except Exception as e:
        logger.error("Failed to initialize components", extra={"error": str(e)})
        raise


def process_tickers(tickers: List[Dict], processor: TickerProcessor) -> ProcessingResult:
    """Process tickers with detailed tracking."""
    result = ProcessingResult(
        ticker_count=len(tickers),
        successful=[],
        failed={},
        updated_tables={}
    )

    for ticker in tickers:
        symbol = ticker["symbol"]
        try:
            logger.info(f"Starting processing for {symbol}", extra={"ticker_id": ticker["id"]})
            updates = processor.process_ticker(ticker)
            result.successful.append(symbol)
            result.updated_tables[symbol] = list(updates)
            logger.info(f"Completed processing {symbol}", extra={"updates": updates})
        except Exception as e:
            logger.error(f"Error processing {symbol}", extra={"error": str(e)})
            result.failed[symbol] = str(e)

    return result


def lambda_handler(event, context):
    """Main Lambda Entry Point """
    logger.info("Lambda execution started", extra={"event": event or {}})

    # Initializing
    try:
        ticker_fetcher, ticker_processor = initialize_components()
    except Exception as e:
        return {"statusCode": 500, "body": f"Initialization failed: {str(e)}"}

    # Fetching Tickers from Supabase
    tickers = ticker_fetcher.fetch_tickers()
    if not tickers:
        logger.warning("No tickers found in Supabase!")
        return {"statusCode": 400, "body": "No tickers found"}

        # Processing the Tickers
    result = process_tickers(tickers, ticker_processor)

    # Build and return Summary
    summary = (
            f"Processed {result.ticker_count} tickers\n"
            f"Successful: {len(result.successful)}\n"
            f"Failed: {len(result.failed)}\n"
            f"Details:\n" +
            "\n".join(
                f"{s}: {', '.join(result.updated_tables.get(s, ['No updates']))}"
                if s in result.successful else f"{s}: Failed - {result.failed[s]}"
                for s in (result.successful + list(result.failed.keys()))
            )
    )

    logger.info("Execution completed", extra={"summary": summary})

    return {
        "statusCode": 200 if not result.failed else 207,
        "body": summary
    }


if __name__ == "__main__":
    result = lambda_handler(None, None)
    print(result["body"])
