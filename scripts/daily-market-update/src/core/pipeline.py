"""
Pipeline for orchestrating the market data update process.
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Any
from pydantic import BaseModel

from src.core.logging_config import setup_logging
from src.events.event_processor import PipelineConfig
from src.services.ticker_selector import TickerSelector
from src.services.ticker_processor import TickerProcessor

logger = setup_logging(name="pipeline")


class ProcessingResult(BaseModel):
    """Results of processing a set of tickers."""

    ticker_count: int = 0
    successful: List[str] = []
    failed: Dict[str, str] = {}
    updated_tables: Dict[str, List[str]] = {}
    processing_time: Dict[str, float] = {}


class Pipeline:
    """
    Orchestrates the market data update process.
    """

    def __init__(self, config: PipelineConfig, supabase_client):
        """
        Initialize the pipeline.

        Args:
            config: Pipeline configuration
            supabase_client: Supabase client for database operations
        """
        self.config = config
        self.supabase = supabase_client

        # Initialize components
        self.ticker_selector = TickerSelector(supabase_client)
        self.ticker_processor = TickerProcessor(supabase_client)

        # Initialize result tracking
        self.result = ProcessingResult()

    def execute(self) -> ProcessingResult:
        """
        Execute the pipeline.

        Returns:
            Processing results
        """
        start_time = time.time()
        logger.info("Starting pipeline execution", extra={"config": self.config})

        # 1. Select tickers to process
        tickers = self.ticker_selector.select_tickers(self.config)
        self.result.ticker_count = len(tickers)

        if not tickers:
            logger.warning("No tickers selected for processing")
            return self.result

        # 2. Process tickers
        if self.config.batch_mode and len(tickers) > 1:
            self._process_in_parallel(tickers)
        else:
            self._process_sequentially(tickers)

        # 3. Record total processing time
        total_time = time.time() - start_time
        self.result.processing_time["total"] = total_time

        logger.info(
            f"Pipeline execution completed in {total_time:.2f}s. "
            f"Processed {self.result.ticker_count} tickers: "
            f"{len(self.result.successful)} successful, "
            f"{len(self.result.failed)} failed."
        )

        return self.result

    def _process_sequentially(self, tickers: List[Dict[str, Any]]) -> None:
        """Process tickers one at a time."""
        for ticker in tickers:
            symbol = ticker["symbol"]
            ticker_start = time.time()

            try:
                # Process the ticker
                updates = self.ticker_processor.process_ticker(ticker, self.config)

                # Record success
                self.result.successful.append(symbol)
                self.result.updated_tables[symbol] = list(updates)

                # Record processing time
                processing_time = time.time() - ticker_start
                self.result.processing_time[symbol] = processing_time

                logger.info(
                    f"Processed {symbol} in {processing_time:.2f}s, updated: {updates}"
                )

            except Exception as e:
                # Record failure
                logger.error(f"Failed to process {symbol}: {e}", exc_info=True)
                self.result.failed[symbol] = str(e)

                # Record processing time even for failures
                processing_time = time.time() - ticker_start
                self.result.processing_time[symbol] = processing_time

    def _process_in_parallel(self, tickers: List[Dict[str, Any]]) -> None:
        """Process tickers in parallel using thread pool."""
        # Determine batch size and max workers
        batch_size = min(self.config.batch_size, len(tickers))
        max_workers = min(self.config.max_workers, batch_size)

        logger.info(
            f"Processing {len(tickers)} tickers in parallel with {max_workers} workers"
        )

        # Create batches
        batches = [
            tickers[i : i + batch_size] for i in range(0, len(tickers), batch_size)
        ]

        # Process each batch
        for batch_num, batch in enumerate(batches, 1):
            logger.info(
                f"Processing batch {batch_num}/{len(batches)} with {len(batch)} tickers"
            )
            batch_start = time.time()

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all tasks
                future_to_symbol = {
                    executor.submit(self._process_single_ticker, ticker): ticker[
                        "symbol"
                    ]
                    for ticker in batch
                }

                # Process results as they complete
                for future in as_completed(future_to_symbol):
                    symbol = future_to_symbol[future]
                    try:
                        result = future.result()
                        if result["success"]:
                            self.result.successful.append(symbol)
                            self.result.updated_tables[symbol] = result["updates"]
                        else:
                            self.result.failed[symbol] = result["error"]

                        self.result.processing_time[symbol] = result["processing_time"]

                    except Exception as e:
                        logger.error(f"Unexpected error processing {symbol}: {e}")
                        self.result.failed[symbol] = str(e)

            # Log batch completion
            batch_time = time.time() - batch_start
            logger.info(f"Completed batch {batch_num} in {batch_time:.2f}s")

            # Add a small delay between batches to reduce API pressure
            if batch_num < len(batches):
                time.sleep(1.0)

    def _process_single_ticker(self, ticker: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single ticker and return a structured result.
        Used for parallel processing.

        Returns:
            Dict with processing results
        """
        symbol = ticker["symbol"]
        start_time = time.time()

        try:
            # Process the ticker
            updates = self.ticker_processor.process_ticker(ticker, self.config)
            processing_time = time.time() - start_time

            logger.info(
                f"Processed {symbol} in {processing_time:.2f}s, updated: {updates}"
            )

            return {
                "success": True,
                "updates": list(updates),
                "processing_time": processing_time,
            }

        except Exception as e:
            # Handle failure
            processing_time = time.time() - start_time
            logger.error(f"Failed to process {symbol}: {e}")

            return {
                "success": False,
                "error": str(e),
                "processing_time": processing_time,
            }
