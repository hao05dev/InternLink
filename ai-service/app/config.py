"""Compatibility import. Settings are instantiated by create_app, not here."""
from app.core.config import Settings

__all__ = ["Settings"]
