# New Pipeline Architecture

## (Planned) Improvements over old Pipeline

1. Actually using a Pipeline Framework that allows us to compose different stages based on requirements.
   Ticker Selection → Data Acquisition → Data Transformation → Data Storage
2. Single Responsibility for different parts of the Pipeline
3. Better Data Model definitions and mapping
4. Clearer separation between fetching and saving Data
5. Event Driven (custom events etc...)

### Todos

1. Throttling for YhFinance API calls (/ batching so we're calling from different servers?)

### Processing Flow

1. Fetch Tickers (specific or all)
2. Fetch YhFinance (parse and validate source)
3. Transform (Source to destination model mapping (business logic??))
4. Upload to my DB

### Event Driven

**Event types:**

1. Scheduled (Daily market update)
2. Initialize (processing a new ticker)
3. Update (Force update specific tickers)
4. Backfill (Run Historical Data Backfill for specific tickers)
5. Dividend (Some Dividend Related Stuff)

**Structure of Payload**:

```json
{
  "type": "initialize", // Event type
  "tickers": ["AAPL", "MSFT", "GOOGL"], // Specific tickers to process
  "start_date": "2020-01-01", // Optional - for backfill
  "config": {
    // Optional configuration overrides
    "backfill": true,
    "prices": true,
    "info": true,
    "calendar": true,
    "fund_data": true
  }
}
```
