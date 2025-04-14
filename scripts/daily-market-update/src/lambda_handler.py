import json
import os
from datetime import datetime
from typing import Dict, List, Any
from pydantic import BaseModel
from src.core.config import SUPABASE_URL, SUPABASE_KEY
from src.core.pipeline import Pipeline
from src.core.supabase_client import SupabaseClient
from src.core.logging_config import setup_logging
from src.events.event_processor import EventProcessor

logger = setup_logging(name="ticker_processor")


class ProcessingResult(BaseModel):
    ticker_count: int
    successful: List[str]
    failed: Dict[str, str]
    updated_tables: Dict[str, List[str]]


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function.

    Args:
        event: Event data from Lambda trigger
        context: Lambda context

    Returns:
        Response with status code and processing results
    """
    # Get region from environment
    region = os.environ.get("AWS_REGION", "us-east-1")

    logger.info(
        "Starting Lambda execution",
        extra={"region": region, "event": event or {}}
    )

    try:
        # Initialize Supabase client
        supabase = SupabaseClient(SUPABASE_URL, SUPABASE_KEY).get_client()

        # Process the event
        event_processor = EventProcessor(event, region)
        pipeline_config = event_processor.create_pipeline_config()

        # Execute the pipeline
        pipeline = Pipeline(pipeline_config,supabase)
        result = pipeline.execute()

        # Prepare response
        response = {
            "statusCode": 200 if not result.failed else 207,  # Partial success
            "region": region,
            "summary": _format_result_summary(result),
            "metrics": {
                "tickerCount": result.ticker_count,
                "successCount": len(result.successful),
                "failureCount": len(result.failed),
                "totalProcessingTime": result.processing_time.get("total", 0)
            }
        }

        if event.get('event_record_id'):
            try:
                status = "completed" if not result.failed else "failed"
                error_message = None
                if result.failed:
                    error_message = ", ".join([f"{k}: {v}" for k, v in result.failed.items()])

                supabase.table("ticker_events").update({
                    "status": status,
                    "completed_at": datetime.now().isoformat(),
                    "error_message": error_message,
                    "details": {"processing_results": result.model_dump()}
                }).eq("id", event['event_record_id']).execute()

            except Exception as e:
                logger.error(f"Failed to update event status: {e}")

        logger.info("Lambda execution completed successfully", extra={"metrics": response["metrics"]})
        return response

    except Exception as e:
        logger.error(f"Lambda execution failed: {e}", exc_info=True)
        return {
            "statusCode": 500,
            "body": f"Execution failed: {str(e)}"
        }


def _format_result_summary(result) -> str:
    """Format results into a readable summary string."""
    summary = [
        f"Processed {result.ticker_count} tickers in {result.processing_time.get('total', 0):.2f}s",
        f"Successful: {len(result.successful)}",
        f"Failed: {len(result.failed)}",
        ""
    ]

    # Add details for each ticker
    for symbol in sorted(result.successful):
        updates = ", ".join(result.updated_tables.get(symbol, []))
        time = result.processing_time.get(symbol, 0)
        summary.append(f"✓ {symbol}: {updates} ({time:.2f}s)")

    for symbol, error in sorted(result.failed.items()):
        time = result.processing_time.get(symbol, 0)
        summary.append(f"✗ {symbol}: {error} ({time:.2f}s)")

    return "\n".join(summary)


if __name__ == "__main__":
    # For local testing
    test_event = {
        "type": "update_indices",
        "config": {
            "batch_mode": True,
            "max_workers": 3
        }
    }

    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))