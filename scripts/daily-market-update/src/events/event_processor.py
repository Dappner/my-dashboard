"""
Event processing module for handling different types of market data update events.

This module contains classes and functions to parse and validate incoming events,
and configure the pipeline based on the event type.
"""

from datetime import date, datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, field_validator

from src.core.logging_config import setup_logging

logger = setup_logging(name="event_processor")


class EventType(str, Enum):
    """Types of events that can be processed by the pipeline."""

    SCHEDULED = "scheduled"  # Regular scheduled update
    INITIALIZE = "initialize"  # Process new tickers with backfill
    UPDATE = "update"  # Force update specific tickers
    BACKFILL = "backfill"  # Historical data backfill
    DIVIDEND = "dividend"  # Process only dividend suggestions


class PipelineConfig(BaseModel):
    """Configuration for the pipeline execution."""

    process_prices: bool = True
    process_info: bool = True
    process_calendar: bool = True
    process_fund_data: bool = True
    force_update: bool = False
    backfill: bool = False
    start_date: Optional[date] = None
    specific_tickers: Optional[List[str]] = None


class EventConfig(BaseModel):
    """Configuration options that can be provided in an event."""

    backfill: Optional[bool] = None
    prices: Optional[bool] = None
    info: Optional[bool] = None
    calendar: Optional[bool] = None
    fund_data: Optional[bool] = None


class EventPayload(BaseModel):
    """Schema for the event payload."""

    type: EventType = EventType.SCHEDULED
    tickers: Optional[List[str]] = None
    start_date: Optional[str] = None
    config: Optional[EventConfig] = None

    @field_validator("start_date")
    @classmethod
    def validate_start_date(cls, v):
        """Validate and convert start_date to the correct format."""
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

    This class is responsible for:
    - Parsing and validating event payloads
    - Creating appropriate pipeline configuration based on event type
    - Handling defaults and overrides
    """

    def __init__(self, event: Dict[str, Any]):
        """
        Initialize the event processor with the raw event data.

        Args:
            event: The event dictionary from the Lambda handler
        """
        self.raw_event = event or {}

        try:
            # Parse and validate the event payload
            self.event = EventPayload(**self.raw_event)
            logger.info(
                f"Processed event of type {self.event.type}",
                extra={"event_type": self.event.type},
            )
        except Exception as e:
            # If parsing fails, default to scheduled event
            logger.warning(
                f"Failed to parse event payload: {e}. Defaulting to scheduled event.",
                extra={"raw_event": self.raw_event},
            )
            self.event = EventPayload(type=EventType.SCHEDULED)

    def create_pipeline_config(self) -> PipelineConfig:
        """
        Create a pipeline configuration based on the event type and parameters.

        Returns:
            PipelineConfig object with the appropriate settings
        """
        # Start with default configuration
        config = PipelineConfig()

        # Apply event-type specific configurations
        if self.event.type == EventType.SCHEDULED:
            # Default scheduled behavior - no changes needed
            pass

        elif self.event.type == EventType.INITIALIZE:
            # New tickers need backfill
            config.backfill = True
            config.force_update = True
            # Use the provided start date or default to 5 years ago
            config.start_date = self.event.start_date or date(
                date.today().year - 5, 1, 1
            )
            config.specific_tickers = self.event.tickers

        elif self.event.type == EventType.UPDATE:
            # Force update regardless of last update time
            config.force_update = True
            config.specific_tickers = self.event.tickers

        elif self.event.type == EventType.BACKFILL:
            # Historical data backfill
            config.backfill = True
            # Require start date for backfill
            if not self.event.start_date:
                logger.warning(
                    "No start_date provided for backfill event. Using default (5 years)."
                )
                config.start_date = date(date.today().year - 5, 1, 1)
            else:
                config.start_date = self.event.start_date
            config.specific_tickers = self.event.tickers

        elif self.event.type == EventType.DIVIDEND:
            # Only process dividend suggestions
            config.process_prices = False
            config.process_info = False
            config.process_calendar = False
            config.process_fund_data = False
            config.specific_tickers = self.event.tickers

        # Apply any overrides from the event config
        if self.event.config:
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

        logger.info(
            f"Created pipeline configuration for {self.event.type} event",
            extra={"config": config.model_dump()},
        )

        return config
