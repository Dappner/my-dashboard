import logging

logger = logging.getLogger(__name__)


class TickerFetcher:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def fetch_tickers(self):
        try:
            response = (
                self.supabase.table("tickers")
                .select("id, symbol, exchange, backfill")
                .execute()
            )
            logger.debug(f"Fetched {len(response.data)} tickers from Supabase")
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch tickers from Supabase: {e}")
            return []
