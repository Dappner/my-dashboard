from supabase import create_client
from src.core.logging_config import setup_logging


logger = setup_logging(name="ticker_processor")


class SupabaseClient:
    def __init__(self, url, key):
        self.url = url
        self.key = key
        self.client = self._create_client()

    def _create_client(self):
        try:
            return create_client(self.url, self.key)
        except Exception as e:
            logger.error(f"Failed to create Supabase client: {e}")
            raise

    def get_client(self):
        return self.client
