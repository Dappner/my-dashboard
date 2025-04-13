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
    """

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def select_tickers(self, config: PipelineConfig) -> List[Dict[str, Any]]:
        """
        Select tickers based on the pipeline configuration.

        Args:
            config: Pipeline configuration with selection criteria

        Returns:
            List of ticker dictionaries
        """
        if config.specific_tickers:
            # Specific tickers take precedence
            return self.fetch_specific_tickers(config.specific_tickers)
        elif config.ticker_types:
            # Filter by ticker types
            return self.fetch_tickers_by_type(config.ticker_types)
        else:
            # Default to all tickers
            return self.fetch_all_tickers()

    def fetch_all_tickers(self) -> List[Dict[str, Any]]:
        """Fetch all tickers from the database."""
        try:
            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill, quote_type")
                .execute()
            )
            tickers = response.data
            logger.info(f"Fetched {len(tickers)} tickers from database")
            return self._validate_tickers(tickers)
        except Exception as e:
            logger.error(f"Failed to fetch tickers from database: {e}")
            return []

    def fetch_specific_tickers(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """Fetch specific tickers by symbol."""
        if not symbols:
            logger.warning("No symbols provided for specific ticker fetch")
            return []

        try:
            # Convert symbols to uppercase for consistent matching
            upper_symbols = [s.upper() for s in symbols]

            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill, quote_type")
                .in_("symbol", upper_symbols)
                .execute()
            )

            tickers = response.data
            logger.info(f"Fetched {len(tickers)} specific tickers from database")

            # Check for missing symbols
            found_symbols = [t["symbol"].upper() for t in tickers]
            missing = [s for s in upper_symbols if s not in found_symbols]
            if missing:
                logger.warning(f"Some requested tickers were not found: {missing}")

            return self._validate_tickers(tickers)
        except Exception as e:
            logger.error(f"Failed to fetch specific tickers: {e}")
            return []

    def fetch_tickers_by_type(self, ticker_types: List[str]) -> List[Dict[str, Any]]:
        """Fetch tickers by quote type."""
        if not ticker_types:
            logger.warning("No ticker types provided for type-based fetch")
            return []

        try:
            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill, quote_type")
                .in_("quote_type", ticker_types)
                .execute()
            )

            tickers = response.data
            logger.info(f"Fetched {len(tickers)} tickers of types {ticker_types}")

            return self._validate_tickers(tickers)
        except Exception as e:
            logger.error(f"Failed to fetch tickers by type: {e}")
            return []

    def _validate_tickers(self, tickers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and normalize ticker data."""
        validated = []

        for ticker in tickers:
            # Check required fields
            if not ticker.get("id") or not ticker.get("symbol"):
                logger.warning(f"Skipping invalid ticker: {ticker}")
                continue

            # Ensure symbol is uppercase
            ticker["symbol"] = ticker["symbol"].upper()

            # Set defaults if missing
            if "backfill" not in ticker:
                ticker["backfill"] = False

            if "quote_type" not in ticker:
                ticker["quote_type"] = "EQUITY"  # Default quote type

            validated.append(ticker)

        return validated