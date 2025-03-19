import pytest
import pickle
from unittest.mock import Mock, patch
from src.services.ticker_processor import TickerProcessor
from src.services.data_fetcher import DataFetcher
from src.services.data_saver import DataSaver
from datetime import date

@pytest.fixture
def mock_supabase():
    return Mock()

@pytest.fixture
def ticker_processor(mock_supabase):
    return TickerProcessor(mock_supabase)

def load_yfinance_data(filename):
    with open(f"tests/{filename}", "rb") as f:
        cached_data = pickle.load(f)
    return (
        cached_data["history"],
        cached_data["info"],
        cached_data["calendar"],
        cached_data.get("funds_data")
    )

def test_process_ticker_aapl(ticker_processor):
    ticker = {"id": "aapl-id", "symbol": "AAPL", "exchange": "NASDAQ", "backfill": False}
    real_data, real_info, real_calendar, _ = load_yfinance_data("aapl_yfinance_data.pkl")

    mock_ticker = Mock()
    mock_ticker.history = Mock(return_value=real_data)
    mock_ticker.info = real_info
    mock_ticker.calendar = real_calendar

    with patch.object(DataFetcher, "fetch_stock_data", return_value=(real_data, real_info, mock_ticker)), \
         patch.object(DataSaver, "get_last_update_date", return_value=date(2025, 3, 16)), \
         patch.object(DataSaver, "save_price_data", return_value=1), \
         patch.object(DataSaver, "should_update", return_value=True), \
         patch.object(DataSaver, "update_ticker_info", return_value=True), \
         patch.object(DataSaver, "save_finance_data", return_value=True), \
         patch.object(DataSaver, "save_calendar_events", return_value=True):

        updates = ticker_processor.process_ticker(ticker)

        assert "historical_prices" in updates, "Price data should be updated"
        assert "tickers" in updates, "Ticker info should be updated"
        assert "yh_finance_daily" in updates, "Finance data should be updated"
        assert "calendar_events" in updates, "Calendar events should be updated"
        assert len(updates) == 4, "Expected exactly 4 updates"

        ticker_processor.data_saver.save_price_data.assert_called_once()
        ticker_processor.data_saver.update_ticker_info.assert_called_once()
        ticker_processor.data_saver.save_finance_data.assert_called_once()
        ticker_processor.data_saver.save_calendar_events.assert_called_once_with(
            "aapl-id", "AAPL", mock_ticker
        )

def test_process_ticker_spy(ticker_processor):
    ticker = {"id": "spy-id", "symbol": "SPY", "exchange": "NYSE", "backfill": False}
    real_data, real_info, real_calendar, real_funds_data = load_yfinance_data("spy_yfinance_data.pkl")

    mock_ticker = Mock()
    mock_ticker.history = Mock(return_value=real_data)
    mock_ticker.info = real_info
    mock_ticker.calendar = real_calendar
    mock_ticker.funds_data = Mock()
    if real_funds_data:
        mock_ticker.funds_data.description = real_funds_data["description"]
        mock_ticker.funds_data.fund_overview = real_funds_data["fund_overview"]
        mock_ticker.funds_data.fund_operations = real_funds_data["fund_operations"]
        mock_ticker.funds_data.asset_classes = real_funds_data["asset_classes"]
        mock_ticker.funds_data.top_holdings = real_funds_data["top_holdings"]
        mock_ticker.funds_data.equity_holdings = real_funds_data["equity_holdings"]
        mock_ticker.funds_data.bond_holdings = real_funds_data["bond_holdings"]
        mock_ticker.funds_data.bond_ratings = real_funds_data["bond_ratings"]
        mock_ticker.funds_data.sector_weightings = real_funds_data["sector_weightings"]

    with patch.object(DataFetcher, "fetch_stock_data", return_value=(real_data, real_info, mock_ticker)), \
         patch.object(DataSaver, "get_last_update_date", return_value=date(2025, 3, 16)), \
         patch.object(DataSaver, "save_price_data", return_value=1), \
         patch.object(DataSaver, "should_update", return_value=True), \
         patch.object(DataSaver, "update_ticker_info", return_value=True), \
         patch.object(DataSaver, "save_finance_data", return_value=True), \
         patch.object(DataSaver, "save_calendar_events", return_value=True), \
         patch.object(DataSaver, "save_fund_top_holdings", return_value=bool(real_funds_data and real_funds_data["top_holdings"] is not None)), \
         patch.object(DataSaver, "save_fund_sector_weightings", return_value=bool(real_funds_data and real_funds_data["sector_weightings"] is not None)), \
         patch.object(DataSaver, "save_fund_asset_classes", return_value=bool(real_funds_data and real_funds_data["asset_classes"] is not None)):

        updates = ticker_processor.process_ticker(ticker)

        assert "historical_prices" in updates, "Price data should be updated"
        assert "tickers" in updates, "Ticker info should be updated"
        assert "yh_finance_daily" in updates, "Finance data should be updated"
        assert "calendar_events" in updates, "Calendar events should be updated"

        expected_updates = 4
        if real_funds_data and real_funds_data["top_holdings"] is not None:
            assert "fund_top_holdings" in updates, "Fund top holdings should be updated"
            expected_updates += 1
        if real_funds_data and real_funds_data["sector_weightings"] is not None:
            assert "fund_sector_weightings" in updates, "Fund sector weightings should be updated"
            expected_updates += 1
        if real_funds_data and real_funds_data["asset_classes"] is not None:
            assert "fund_asset_classes" in updates, "Fund asset classes should be updated"
            expected_updates += 1

        assert len(updates) == expected_updates, f"Expected {expected_updates} updates"

        ticker_processor.data_saver.save_price_data.assert_called_once()
        ticker_processor.data_saver.update_ticker_info.assert_called_once()
        ticker_processor.data_saver.save_finance_data.assert_called_once()
        ticker_processor.data_saver.save_calendar_events.assert_called_once_with(
            "spy-id", "SPY", mock_ticker
        )
        if real_funds_data and real_funds_data["top_holdings"] is not None:
            ticker_processor.data_saver.save_fund_top_holdings.assert_called_once_with(
                "spy-id", "SPY", mock_ticker
            )
        if real_funds_data and real_funds_data["sector_weightings"] is not None:
            ticker_processor.data_saver.save_fund_sector_weightings.assert_called_once_with(
                "spy-id", "SPY", mock_ticker
            )
        if real_funds_data and real_funds_data["asset_classes"] is not None:
            ticker_processor.data_saver.save_fund_asset_classes.assert_called_once_with(
                "spy-id", "SPY", mock_ticker
            )

        assert real_info.get("quoteType") == "ETF", "SPY should be an ETF"