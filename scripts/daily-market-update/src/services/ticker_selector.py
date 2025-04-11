"""
Ticker selection service for the market data update process.

This module contains the TickerSelector class that handles selecting tickers
from the database based on configuration parameters.
"""

from typing import Dict, List, Any
from src.core.logging_config import setup_logging

logger = setup_logging(name="ticker_selector")


class TickerSelector:
    """
    Selects tickers to process based on configuration.

    This class is responsible for:
    - Fetching tickers from the database
    - Filtering tickers based on symbols, status, etc.
    - Validating tickers before processing
    """

    def __init__(self, supabase_client):
        """
        Initialize the ticker selector with the Supabase client.

        Args:
            supabase_client: Supabase client for database operations
        """
        self.supabase = supabase_client

    def fetch_all_tickers(self) -> List[Dict[str, Any]]:
        """
        Fetch all tickers from the database.

        Returns:
            List of ticker dictionaries from the database
        """
        try:
            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill, quote_type")
                .execute()
            )

            tickers = response.data
            logger.info(f"Fetched {len(tickers)} tickers from database")

            # Validate tickers
            validated_tickers = self._validate_tickers(tickers)

            return validated_tickers

        except Exception as e:
            logger.error(f"Failed to fetch tickers from database: {e}")
            return []

    def fetch_specific_tickers(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch specific tickers by symbol from the database.

        Args:
            symbols: List of ticker symbols to fetch

        Returns:
            List of ticker dictionaries from the database
        """
        if not symbols:
            logger.warning("No symbols provided for specific ticker fetch")
            return []

        try:
            # Convert symbols to uppercase for consistent matching
            upper_symbols = [s.upper() for s in symbols]

            # Using Supabase's .in() filter for multiple values
            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill, quote_type")
                .in_("symbol", upper_symbols)
                .execute()
            )

            tickers = response.data
            logger.info(f"Fetched {len(tickers)} specific tickers from database")

            # Check if all requested symbols were found
            found_symbols = [t["symbol"].upper() for t in tickers]
            missing_symbols = [s for s in upper_symbols if s not in found_symbols]

            if missing_symbols:
                logger.warning(
                    f"Some requested tickers were not found: {missing_symbols}"
                )

            # Validate tickers
            validated_tickers = self._validate_tickers(tickers)

            return validated_tickers

        except Exception as e:
            logger.error(f"Failed to fetch specific tickers from database: {e}")
            return []

    def _validate_tickers(self, tickers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate tickers to ensure they have required fields.

        Args:
            tickers: List of ticker dictionaries from the database

        Returns:
            List of validated ticker dictionaries
        """
        validated_tickers = []

        for ticker in tickers:
            # Check for required fields
            if not ticker.get("id") or not ticker.get("symbol"):
                logger.warning(f"Skipping invalid ticker: {ticker}")
                continue

            # Ensure symbol is uppercase
            ticker["symbol"] = ticker["symbol"].upper()

            # Ensure backfill is a boolean
            if "backfill" not in ticker:
                ticker["backfill"] = False

            # Add ticker to validated list
            validated_tickers.append(ticker)

        logger.debug(f"Validated {len(validated_tickers)} tickers")
        return validated_tickers
