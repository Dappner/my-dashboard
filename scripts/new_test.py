import yfinance as yf

ticker = yf.Ticker("SPY")
print("Holdings:", ticker.funds_data.top_holdings)
print("Sector Weightings:", ticker.funds_data.sector_weightings)
print("Asset Classes:", ticker.funds_data.asset_classes)
