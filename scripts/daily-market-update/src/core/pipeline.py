"""
Pipeline orchestrator for the market data update process.

This module contains the main Pipeline class that orchestrates the flow of data
through the different stages of the market data update process.
"""

from dataclasses import 
from typing import Dict, List, Any, Set, Optional
from pydantic import BaseModel

from src.core.logging_config import setup_logging
from src.events.event_processor import PipelineConfig
from src.services.ticker_selector import TickerSelector
from src.services.data_fetcher import DataFetcher
from src.services.data_saver import DataSaver

logger = setup_logging(name="pipeline_orchestrator")


class ProcessingResult(BaseModel):
    """Results of processing a set of tickers."""
    ticker_count: int = 0
    successful: List[str] = []
    failed: Dict[str, str] = {}
    updated_tables: Dict[str, List[str]] = {}
    processing_time: Dict[str, float] = {}


class Pipeline:
    """
    Orchestrates the flow of data through the different stages of the market data update process.
    
    This class is responsible for:
    - Coordinating the different pipeline stages
    - Handling errors and retries
    - Collecting metrics and results
    """
    
    def __init__(self, config: PipelineConfig, supabase_client):
        """
        Initialize the pipeline with configuration and dependencies.
        
        Args:
            config: Configuration for the pipeline execution
            supabase_client: Supabase client for database operations
        """
        self.config = config
        self.supabase = supabase_client
        
        # Initialize pipeline components
        self.ticker_selector = TickerSelector(supabase_client)
        self.data_fetcher = DataFetcher()
        self.data_saver = DataSaver(supabase_client)
        
        self.result = ProcessingResult()
    
    def execute(self) -> ProcessingResult:
        """
        Execute the pipeline with the current configuration.
        
        Returns:
            ProcessingResult containing metrics and outcomes
        """
        logger.info("Starting pipeline execution", extra={"config": self.config.model_dump()})
        
        # 1. Select tickers to process
        tickers = self._select_tickers()
        self.result.ticker_count = len(tickers)
        
        if not tickers:
            logger.warning("No tickers selected for processing")
            return self.result
        
        # 2. Process each ticker
        for ticker in tickers:
            self._process_ticker(ticker)
        
        logger.info(
            f"Pipeline execution completed. Processed {self.result.ticker_count} tickers. "
            f"Success: {len(self.result.successful)}, Failed: {len(self.result.failed)}",
            extra={"result_summary": {
                "successful_count": len(self.result.successful),
                "failed_count": len(self.result.failed),
                "failed_tickers": list(self.result.failed.keys())
            }}
        )
        
        return self.result
    
    def _select_tickers(self) -> List[Dict[str, Any]]:
        """
        Select tickers to process based on configuration.
        
        Returns:
            List of ticker dictionaries from the database
        """
        try:
            # If specific tickers were provided in the config, use them
            if self.config.specific_tickers:
                tickers = self.ticker_selector.fetch_specific_tickers(self.config.specific_tickers)
                logger.info(f"Selected {len(tickers)} specific tickers for processing")
            else:
                # Otherwise, fetch all tickers
                tickers = self.ticker_selector.fetch_all_tickers()
                logger.info(f"Selected all {len(tickers)} tickers for processing")
            
            return tickers
        except Exception as e:
            logger.error(f"Failed to select tickers: {e}")
            return []
    
    def _process_ticker(self, ticker: Dict[str, Any]):
        """
        Process a single ticker through all pipeline stages.
        
        Args:
            ticker: Ticker dictionary from the database
        """
        symbol = ticker.get("symbol", "unknown")
        
        try:
            logger.info(f"Processing ticker: {symbol}")
            
            # Track which tables were updated
            updates = self._run_ticker_stages(ticker)
            
            # Record successful processing
            self.result.successful.append(symbol)
            self.result.updated_tables[symbol] = list(updates)
            
            logger.info(f"Successfully processed ticker: {symbol}", extra={"updates": updates})
        
        except Exception as e:
            # Record failed processing
            logger.error(f"Failed to process ticker {symbol}: {e}", exc_info=True)
            self.result.failed[symbol] = str(e)
    
    def _run_ticker_stages(self, ticker: Dict[str, Any]) -> Set[str]:
        """
        Run the ticker through all pipeline stages based on configuration.
        
        Args:
            ticker: Ticker dictionary from the database
        
        Returns:
            Set of names of tables that were updated
        """
        symbol = ticker["symbol"]
        ticker_id = ticker["id"]
        exchange = ticker.get("exchange", "")
        backfill = ticker.get("backfill", False) or self.config.backfill
        
        updates = set()
        
        # Determine appropriate start date
        if self.config.start_date:
            # Use explicit start date from config if provided
            start_date = self.config.start_date
        else:
            # Otherwise determine from last update and backfill setting
            last_price_update = self.data_saver.get_last_update_date(ticker_id, "historical_prices")
            start_date = self.data_fetcher.determine_start_date(last_price_update, backfill)
        
        # Skip checks if force update is enabled
        force_update = self.config.force_update
        
        # 1. Fetch Data Stage
        if (self.config.process_prices or self.config.process_info or self.config.process_calendar):
            data, info, yf_ticker = self.data_fetcher.fetch_stock_data(
                symbol, exchange, start_date
            )
            
            # 2. Process and Save Stages (only if fetch was successful)
            if data is not None and self.config.process_prices:
                if self.data_saver.save_price_data(ticker_id, symbol, data):
                    updates.add("historical_prices")
            
            if info and self.config.process_info:
                last_finance_update = self.data_saver.get_last_update_date(ticker_id, "yh_finance_daily")
                if force_update or backfill or self.data_saver.should_update(last_finance_update):
                    if self.data_saver.update_ticker_info(ticker_id, symbol, info, backfill):
                        updates.add("tickers")
                    
                    if self.data_saver.save_finance_data(ticker_id, symbol, info):
                        updates.add("yh_finance_daily")
            
            # 3. Process Calendar Events
            if yf_ticker and self.config.process_calendar:
                last_calendar_update = self.data_saver.get_last_update_date(ticker_id, "calendar_events")
                if force_update or backfill or self.data_saver.should_update(last_calendar_update, threshold_days=7):
                    if self.data_saver.save_calendar_events(ticker_id, symbol, yf_ticker):
                        updates.add("calendar_events")
            
            # 4. Process Fund Data
            if yf_ticker and self.config.process_fund_data and info:
                quote_type = info.get("quoteType", "EQUITY")
                if quote_type in ["MUTUALFUND", "ETF"]:
                    fund_updates = self._process_fund_data(ticker_id, symbol, yf_ticker)
                    updates.update(fund_updates)
        
        # 5. Special Processing
        if "historical_prices" in updates:
            # Generate dividend payment suggestions if prices were updated
            dividend_count = self._process_dividend_suggestions(ticker_id, symbol)
            if dividend_count > 0:
                updates.add("suggested_trades")
        
        return updates
    
    def _process_fund_data(self, ticker_id: str, symbol: str, yf_ticker) -> Set[str]:
        """
        Process fund-specific data for ETFs and mutual funds.
        
        Args:
            ticker_id: Database ID for the ticker
            symbol: Ticker symbol
            yf_ticker: YFinance ticker object
        
        Returns:
            Set of names of tables that were updated
        """
        updates = set()
        
        # Save fund top holdings
        if self.data_saver.save_fund_top_holdings(ticker_id, symbol, yf_ticker):
            updates.add("fund_top_holdings")
        
        # Save fund sector weightings
        if self.data_saver.save_fund_sector_weightings(ticker_id, symbol, yf_ticker):
            updates.add("fund_sector_weightings")
        
        # Save fund asset classes
        if self.data_saver.save_fund_asset_classes(ticker_id, symbol, yf_ticker):
            updates.add("fund_asset_classes")
        
        return updates
    
    def _process_dividend_suggestions(self, ticker_id: str, symbol: str) -> int:
        """
        Process dividend payment suggestions.
        
        Args:
            ticker_id: Database ID for the ticker
            symbol: Ticker symbol
        
        Returns:
            Number of dividend suggestions created
        """
        # This would use the existing _process_dividend_suggestions method from ticker_processor.py
        # For now, return 0 as a placeholder - will be implemented properly
        return 0  # TODO: Implement dividend suggestions processing
