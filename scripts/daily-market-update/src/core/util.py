from typing import Any, Callable, Optional


def get_value(
        data: dict,
        key: str,
        cast_type: Optional[Callable] = None,
        default: Any = None
) -> Any:
    """
    Safely retrieves a value from a dict, optionally casting it to a specified type.

    Args:
        data: The dictionary to extract the value from.
        key: The key to look up.
        cast_type: Optional type to cast the value to (e.g., float, int).
        default: Value to return if key is missing or value is None.

    Returns:
        The value (cast if specified), or default if not found/None.
    """
    value = data.get(key)
    if value is not None and cast_type:
        try:
            return cast_type(value)
        except (ValueError, TypeError) as e:
            return default
    return value if value is not None else default
