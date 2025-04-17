"""
Data fetcher module for retrieving data from Yahoo Finance.
"""

import yfinance as yf
import time
import random
from datetime import date, timedelta
from typing import Optional

from src.core.logging_config import setup_logging
from src.models.source_models import YFTickerData

logger = setup_logging(name="data_fetcher")


class DataFetcher:
    """
    Fetches financial data from Yahoo Finance.
    """

    def __init__(self, rate_limit_delay: float = 0.2):
        """
        Initialize the data fetcher.

        Args:
            rate_limit_delay: Minimum delay between requests (seconds)
        """
        self.exchange_map = {
            "NASDAQ": "",
            "NYSE": "",
            "AMEX": ".AM",
            "TSX": ".TO",
            "LSE": ".L",
            "FRA": ".F",
            "TSE": ".T",
            "HKEX": ".HK",
            "SSE": ".SS",
        }
        self.last_request_time = 0
        self.rate_limit_delay = rate_limit_delay

    def _respect_rate_limits(self) -> None:
        """Apply rate limiting between requests."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time

        if elapsed < self.rate_limit_delay:
            # Need to wait to respect rate limit
            sleep_time = self.rate_limit_delay - elapsed
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)

        self.last_request_time = time.time()

    def format_yahoo_ticker(self, symbol: str, exchange: str) -> str:
        """
        Format ticker symbol with exchange suffix for Yahoo Finance.

        Args:
            symbol: Base ticker symbol
            exchange: Exchange identifier

        Returns:
            Formatted ticker symbol for Yahoo Finance
        """
        if not exchange:
            return symbol

        suffix = self.exchange_map.get(exchange.upper(), "")
        if not suffix and exchange.upper() not in self.exchange_map:
            logger.warning(
                f"Unknown exchange {exchange} for {symbol}; using symbol as is"
            )

        return f"{symbol}{suffix}"

    def fetch_ticker_data(
        self, symbol: str, exchange: str, start_date: date, max_retries: int = 3
    ) -> Optional[YFTickerData]:
        """
        Fetch all relevant data for a ticker from Yahoo Finance.

        Args:
            symbol: Ticker symbol
            exchange: Exchange identifier
            start_date: Start date for historical data
            max_retries: Maximum retry attempts for rate limiting

        Returns:
            YFTickerData object with all fetched data, or None if failed
        """
        yahoo_symbol = self.format_yahoo_ticker(symbol, exchange)
        logger.info(f"Fetching data for {symbol} ({yahoo_symbol}) from {start_date}")

        # Apply rate limiting
        self._respect_rate_limits()

        # Try to fetch with retries for rate limiting
        for attempt in range(max_retries + 1):
            try:
                # Create YFinance ticker object
                ticker = yf.Ticker(yahoo_symbol)

                data = ticker.history(
                    start=start_date, end=date.today(), auto_adjust=True
                )
                # Convert to our structured model (the method in the fetcher doesn't work....)
                # We should try to get all the data here and then drop it into the model
                result = YFTickerData.from_yfinance(
                    ticker=ticker,
                    symbol=symbol,
                    exchange=exchange,
                )

                return result

            except Exception as e:
                # Check if it's a rate limit error
                if "too many requests" in str(e).lower() and attempt < max_retries:
                    # Exponential backoff
                    wait_time = (2**attempt) + random.uniform(0, 1)
                    logger.warning(
                        f"Rate limited for {symbol}, retry {attempt + 1}/{max_retries} "
                        f"after {wait_time:.2f}s"
                    )
                    time.sleep(wait_time)
                    continue

                # Other error or final retry failed
                logger.error(f"Failed to fetch data for {symbol}: {e}", exc_info=True)
                return None

    def determine_start_date(
        self, last_update_date: Optional[date], backfill: bool = False
    ) -> date:
        """
        Determine the appropriate start date for data fetching.

        Args:
            last_update_date: Date of the last update in the database
            backfill: Whether to perform historical backfill

        Returns:
            Start date for data fetching
        """
        today = date.today()

        if backfill:
            return date(2020, 1, 1)

        if last_update_date:
            # Start from day of last update
            return last_update_date

        # Default to 30 days ago
        return today - timedelta(days=30)
