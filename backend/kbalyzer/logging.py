"""Logging module."""

import logging
import sys
from typing import Literal

from kbalyzer.settings import settings

LOGGING_FORMATTER = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DebugLevels = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


def get_logger(name: str | None = None, level: DebugLevels | None = None) -> logging.Logger:
    """Configure logger with the given name and logging level.

    Args:
        name (str | None): The name of the logger. Defaults to None.
        level (DebugLevel): The logging level. Defaults to DebugLevel.DEBUG.

    Returns:
        logging.Logger: The configured logger object.

    """
    logger = logging.getLogger(name=name)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(LOGGING_FORMATTER)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    if level is None:
        level = "DEBUG" if settings.ENV == "dev" else "INFO"

    logger.setLevel(level=level)
    return logger
