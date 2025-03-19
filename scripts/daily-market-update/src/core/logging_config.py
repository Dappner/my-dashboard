import logging
import sys
from typing import Optional


def setup_logging(
        name: str = "daily-market-update",
        level: int = logging.INFO,
        log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        extra_handlers: Optional[list] = None
) -> logging.Logger:
    """
    Configure and return a logger with structured logging.

    Args:
        name: Name of the logger (default: "daily-market-update").
        level: Logging level (default: INFO).
        log_format: Format string for log messages.
        extra_handlers: Additional handlers to add (optional).

    Returns:
        Configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers if already configured
    if not logger.handlers:
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)

        # Formatter
        formatter = logging.Formatter(log_format)
        console_handler.setFormatter(formatter)

        # Add handlers
        logger.addHandler(console_handler)

        # Add extra handlers if provided
        if extra_handlers:
            for handler in extra_handlers:
                logger.addHandler(handler)

    # Prevents propagation to root logger
    logger.propagate = False

    return logger
