"""
Event processing module for handling different types of market data update events.

This module contains classes and functions to parse and validate incoming events,
and configure the pipeline based on the event type.
"""

from datetime import date, datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, field_validator
from src.core.logging_config import setup_logging
from src.models.db_models import DBQuoteType

logger = setup_logging(name="event_processor")


class EventType(str, Enum):
    """Types of events that can be processed by the pipeline."""

    # Regular processing events
    SCHEDULED = "scheduled"  # Regular scheduled update for normal tickers
    UPDATE = "update"  # Force update specific tickers

    # Specialized processing events
    INITIALIZE = "initialize"  # Process new tickers with full backfill
    BACKFILL = "backfill"  # Historical data backfill for existing tickers

    # Data type specific events
    UPDATE_INDICES = "update_indices"  # Update market indices
    UPDATE_ETFS = "update_etfs"  # Update ETFs
    UPDATE_EQUITIES = "update_equities"  # Update regular stocks
    UPDATE_FOREX = "update_forex"  # Update forex rates

    # Batch processing
    BATCH = "batch"  # Process a specific batch of tickers


class PipelineConfig(BaseModel):
    """Configuration for the pipeline execution."""

    # Processing flags - what data types to process
    process_prices: bool = True
    process_info: bool = True
    process_calendar: bool = True
    process_fund_data: bool = True

    # Processing behavior
    force_update: bool = False  # Update regardless of last update timestamp
    backfill: bool = False  # Perform historical backfill

    # Date range
    start_date: Optional[date] = None

    # Ticker selection
    specific_tickers: Optional[List[str]] = None
    ticker_types: Optional[DBQuoteType] = None  # e.g., ["EQUITY", "ETF", "INDEX"]

    # Batch processing
    batch_mode: bool = False
    batch_size: int = 10
    max_workers: int = 5

    # Region awareness
    region: Optional[str] = None


class EventConfig(BaseModel):
    """Configuration options that can be provided in an event."""

    # Processing options
    backfill: Optional[bool] = None
    prices: Optional[bool] = None
    info: Optional[bool] = None
    calendar: Optional[bool] = None
    fund_data: Optional[bool] = None

    # Execution options
    batch_mode: Optional[bool] = None
    batch_size: Optional[int] = None
    max_workers: Optional[int] = None


class EventPayload(BaseModel):
    """Schema for the event payload."""

    type: EventType = EventType.SCHEDULED
    tickers: Optional[List[str]] = None
    start_date: Optional[str] = None
    config: Optional[EventConfig] = None
    region: Optional[str] = None

    @field_validator("start_date")
    @classmethod
    def validate_date(cls, v):
        """Validate and convert date strings to date objects."""
        if v is None:
            return None
        try:
            # Parse date string in YYYY-MM-DD format
            parsed_date = datetime.strptime(v, "%Y-%m-%d").date()
            return parsed_date
        except ValueError:
            raise ValueError("start_date must be in YYYY-MM-DD format")


class EventProcessor:
    """
    Processes incoming events and configures the pipeline accordingly.
    """

    def __init__(self, event: Dict[str, Any], region: Optional[str] = None):
        """
        Initialize the event processor with the raw event data.

        Args:
            event: The event dictionary from the Lambda handler
            region: Optional AWS region identifier (from Lambda environment)
        """
        self.raw_event = event or {}
        self.region = region

        try:
            # Parse and validate the event payload
            self.event = EventPayload(**self.raw_event)
            logger.info(
                f"Processing event of type {self.event.type}",
                extra={"event_type": self.event.type, "region": self.region},
            )
        except Exception as e:
            # If parsing fails, default to scheduled event
            logger.warning(
                f"Failed to parse event payload: {e}. Defaulting to scheduled event.",
                extra={"raw_event": self.raw_event, "region": self.region},
            )
            self.event = EventPayload(type=EventType.SCHEDULED)

    def create_pipeline_config(self) -> PipelineConfig:
        """
        Create a pipeline configuration based on the event type and parameters.

        Returns:
            PipelineConfig object with the appropriate settings
        """
        # Initialize config with region awareness
        config = PipelineConfig(region=self.region or self.event.region)

        # Configure based on event type
        self._configure_for_event_type(config)

        # Apply any explicit overrides from the event config
        self._apply_config_overrides(config)

        # Log the final configuration
        logger.info(
            f"Created pipeline configuration for {self.event.type} event",
            extra={"config": config.model_dump(exclude_none=True)},
        )

        return config

    def _configure_for_event_type(self, config: PipelineConfig) -> None:
        """
        Configure the pipeline based on the event type.

        Args:
            config: The PipelineConfig to modify
        """
        event_type = self.event.type

        # Handle each event type
        if event_type == EventType.SCHEDULED:
            # Default scheduled behavior - Equity and ETF
            config.ticker_types = ["EQUITY", "ETF", "MUTUALFUND"]
            pass
        if event_type == EventType.UPDATE_INDICES:
            config.ticker_types = ["INDEX"]
            config.process_calendar = False

        elif event_type == EventType.UPDATE:
            # Force update specific tickers
            config.force_update = True
            config.specific_tickers = self.event.tickers

        elif event_type == EventType.INITIALIZE:
            # Initialize new tickers with backfill
            config.backfill = True
            config.force_update = True
            config.start_date = self.event.start_date or date(
                date.today().year - 5, 1, 1
            )
            config.specific_tickers = self.event.tickers

        elif event_type == EventType.BACKFILL:
            # Historical data backfill
            config.backfill = True
            if not self.event.start_date:
                logger.warning(
                    "No start_date provided for backfill event. Using default (5 years)."
                )
                config.start_date = date(date.today().year - 5, 1, 1)
            else:
                config.start_date = self.event.start_date
            config.specific_tickers = self.event.tickers

        elif event_type == EventType.UPDATE_INDICES:
            # Update market indices
            config.force_update = True
            config.ticker_types = ["INDEX"]
            if self.event.tickers:
                config.specific_tickers = self.event.tickers

        elif event_type == EventType.UPDATE_ETFS:
            # Update ETFs
            config.force_update = True
            config.ticker_types = ["ETF"]
            config.process_fund_data = True
            if self.event.tickers:
                config.specific_tickers = self.event.tickers

        elif event_type == EventType.UPDATE_EQUITIES:
            # Update regular stocks
            config.force_update = True
            config.ticker_types = ["EQUITY"]
            config.process_fund_data = False
            if self.event.tickers:
                config.specific_tickers = self.event.tickers

        elif event_type == EventType.UPDATE_FOREX:
            # Update forex rates
            config.force_update = True
            config.ticker_types = ["CURRENCY"]
            config.process_calendar = False
            config.process_fund_data = False
            if self.event.tickers:
                config.specific_tickers = self.event.tickers

        elif event_type == EventType.BATCH:
            # Batch processing mode
            config.batch_mode = True
            config.force_update = True
            config.specific_tickers = self.event.tickers

    def _apply_config_overrides(self, config: PipelineConfig) -> None:
        """
        Apply explicit overrides from the event config.

        Args:
            config: The PipelineConfig to modify
        """
        if not self.event.config:
            return

        # Process overrides
        if self.event.config.backfill is not None:
            config.backfill = self.event.config.backfill

        if self.event.config.prices is not None:
            config.process_prices = self.event.config.prices

        if self.event.config.info is not None:
            config.process_info = self.event.config.info

        if self.event.config.calendar is not None:
            config.process_calendar = self.event.config.calendar

        if self.event.config.fund_data is not None:
            config.process_fund_data = self.event.config.fund_data

        if self.event.config.batch_mode is not None:
            config.batch_mode = self.event.config.batch_mode

        if self.event.config.batch_size is not None:
            config.batch_size = self.event.config.batch_size

        if self.event.config.max_workers is not None:
            config.max_workers = self.event.config.max_workers

