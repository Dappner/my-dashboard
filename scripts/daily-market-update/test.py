import yfinance as yf
from datetime import date
from dateutil.relativedelta import relativedelta


end_date = date(2025, 3, 20)
start_date = end_date - relativedelta(days=5)


symbol = "TAP"
yf_ticker = yf.Ticker(symbol)
real_data = yf_ticker.history(start=start_date, end=end_date, auto_adjust=True)

print(real_data)
