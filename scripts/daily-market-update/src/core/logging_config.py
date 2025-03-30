import logging
import sys
from typing import Optional
from pythonjsonlogger import jsonlogger


def setup_logging(
    name: str = "daily-market-update",
    level: int = logging.INFO,
    log_format: str = "%(asctime)s %(name)s %(levelname)s %(message)s",
    extra_handlers: Optional[list] = None,
) -> logging.Logger:
    """
    Configure and return a logger with structured JSON logging.

    Args:
        name: Name of the logger (default: "daily-market-update").
        level: Logging level string (e.g., "INFO", "DEBUG", default: LOG_LEVEL env var or INFO).
        log_format: Format string defining the core fields for the JSON logger.
        extra_handlers: Additional handlers to add (optional).

    Returns:
        Configured logger instance.
    """
    logger = logging.getLogger(name)
    # Use logging._checkLevel to convert string level name to int
    logger.setLevel(level)

    # Avoid duplicate handlers if already configured
    # Important in Lambda environments where the function might be reused
    if not logger.handlers:
        # Console handler - Lambda logs go to stdout/stderr
        console_handler = logging.StreamHandler(sys.stdout)
        # Set level on handler as well (though logger level is primary filter)
        # console_handler.setLevel(logging._checkLevel(level))

        formatter = jsonlogger.JsonFormatter(
            fmt=log_format,
        )

        console_handler.setFormatter(formatter)

        # Add the primary handler
        logger.addHandler(console_handler)

        # Add extra handlers if provided
        if extra_handlers:
            for handler in extra_handlers:
                logger.addHandler(handler)

    logger.propagate = False

    return logger
