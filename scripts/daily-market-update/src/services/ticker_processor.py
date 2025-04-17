"""
Ticker processor for handling the flow of data processing.
"""

from typing import Dict, Set, Any

from src.core.logging_config import setup_logging
from src.events.event_processor import PipelineConfig
from src.services.data_fetcher import DataFetcher
from src.services.data_saver import DataSaver
from src.transformers.model_transformer import ModelTransformer

logger = setup_logging(name="ticker_processor")


class TickerProcessor:
    """
    Processes tickers by fetching data and saving to the database.
    """

    def __init__(self, supabase_client):
        """
        Initialize the ticker processor.

        Args:
            supabase_client: Supabase client for database operations
        """
        self.data_fetcher = DataFetcher()
        self.data_saver = DataSaver(supabase_client)
        self.transformer = ModelTransformer()

    def process_ticker(
        self, ticker: Dict[str, Any], config: PipelineConfig
    ) -> Set[str]:
        """
        Process a single ticker.

        Args:
            ticker: Ticker dictionary with metadata
            config: Processing configuration

        Returns:
            Set of updated table names
        """
        symbol = ticker["symbol"]
        ticker_id = ticker["id"]
        exchange = ticker.get("exchange", "")
        backfill = ticker.get("backfill", False) or config.backfill

        logger.info(f"Processing ticker: {symbol}")

        updates = set()

        # Determine start date
        last_price_update = self.data_saver.get_last_update_date(
            ticker_id, "historical_prices"
        )

        start_date = config.start_date or self.data_fetcher.determine_start_date(
            last_price_update, backfill
        )

        # 1. Fetch data from Yahoo Finance
        yf_data = self.data_fetcher.fetch_ticker_data(symbol, exchange, start_date)

        print(yf_data)
        if not yf_data:
            logger.warning(f"Failed to fetch data for {symbol}")
            return updates

        # 2. Transform and save price data
        if config.process_prices and yf_data.price_history:
            db_prices = self.transformer.transform_historical_prices(
                yf_data.price_history, ticker_id
            )

            if db_prices and self.data_saver.save_historical_prices(symbol, db_prices):
                updates.add("historical_prices")

        # 3. Transform and save ticker info
        if config.process_info and yf_data.info:
            # Update ticker info
            db_ticker_info = self.transformer.transform_ticker_info(
                yf_data.info, ticker_id, backfill
            )

            if db_ticker_info and self.data_saver.update_ticker_info(db_ticker_info):
                updates.add("tickers")

            # Save finance daily data
            db_finance = self.transformer.transform_finance_daily(
                yf_data.info, ticker_id
            )

            if db_finance and self.data_saver.save_finance_daily(db_finance):
                updates.add("yh_finance_daily")

        # 4. Transform and save calendar events
        if config.process_calendar and yf_data.calendar:
            db_events = self.transformer.transform_calendar_events(
                yf_data.calendar, ticker_id
            )

            if db_events and self.data_saver.save_calendar_events(
                ticker_id, symbol, db_events
            ):
                updates.add("calendar_events")

        # 5. Transform and save fund data
        if (
            config.process_fund_data
            and yf_data.fund_data
            and yf_data.info.quote_type in ["ETF", "MUTUALFUND"]
        ):
            fund_data = self.transformer.transform_fund_holdings(
                yf_data.fund_data, ticker_id
            )

            fund_updates = self.data_saver.save_fund_data(
                ticker_id,
                symbol,
                fund_data["holdings"],
                fund_data["sectors"],
                fund_data["assets"],
            )

            updates.update(fund_updates)

        logger.info(f"Completed processing {symbol}, updated tables: {updates}")
        return updates
