# ============================================================================
# Helpers Module
# ============================================================================

"""
Helpers module for the parking management system.

This module provides general helper functions that don't fit into other
specific utility modules, including data manipulation, conversion,
formatting, and miscellaneous utilities.
"""

import os
import sys
import json
import time
import math
import random
import string
import hashlib
import base64
import inspect
import functools
import itertools
import collections
from typing import (
    Any, Dict, List, Optional, Union, Tuple, Callable, TypeVar,
    Iterator, Generator, Set, Sequence, Mapping, Iterable
)
from datetime import datetime, date, time, timedelta
from decimal import Decimal, getcontext
from contextlib import contextmanager
from functools import wraps, reduce
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from .string_utils import normalize_string, truncate_string
from .datetime_utils import utc_now, format_datetime


# ============================================================================
# Type Variables
# ============================================================================

T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')


# ============================================================================
# Data Conversion Helpers
# ============================================================================

def safe_cast(value: Any, target_type: type, default: Any = None) -> Any:
    """
    Safely cast a value to a target type.
    
    Args:
        value: Value to cast
        target_type: Target type
        default: Default value if casting fails
        
    Returns:
        Any: Cast value or default
    """
    try:
        if value is None:
            return default
        return target_type(value)
    except (ValueError, TypeError):
        return default


def to_bool(value: Any) -> bool:
    """
    Convert value to boolean.
    
    Args:
        value: Value to convert
        
    Returns:
        bool: Boolean value
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes', 'y', 'on', 't')
    return bool(value)


def to_int(value: Any, default: int = 0) -> int:
    """Convert value to integer."""
    return safe_cast(value, int, default)


def to_float(value: Any, default: float = 0.0) -> float:
    """Convert value to float."""
    return safe_cast(value, float, default)


def to_decimal(value: Any, default: Optional[Decimal] = None) -> Optional[Decimal]:
    """Convert value to Decimal."""
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except Exception:
        return default


def to_str(value: Any, default: str = "") -> str:
    """Convert value to string."""
    if value is None:
        return default
    return str(value)


def to_json(value: Any, default: Any = None) -> Any:
    """Convert JSON string to Python object."""
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return default


def from_json(value: Any, default: str = "{}") -> str:
    """Convert Python object to JSON string."""
    try:
        return json.dumps(value, default=str)
    except (TypeError, ValueError):
        return default


# ============================================================================
# Object Helpers
# ============================================================================

def get_attr_safe(obj: Any, attr: str, default: Any = None) -> Any:
    """
    Safely get attribute from object.
    
    Args:
        obj: Object to get attribute from
        attr: Attribute name (can use dot notation)
        default: Default value if attribute not found
        
    Returns:
        Any: Attribute value or default
    """
    if obj is None:
        return default
    
    parts = attr.split('.')
    current = obj
    
    for part in parts:
        if current is None:
            return default
        if hasattr(current, part):
            current = getattr(current, part)
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return default
    
    return current


def set_attr_safe(obj: Any, attr: str, value: Any) -> bool:
    """
    Safely set attribute on object.
    
    Args:
        obj: Object to set attribute on
        attr: Attribute name (can use dot notation)
        value: Value to set
        
    Returns:
        bool: True if successful, False otherwise
    """
    if obj is None:
        return False
    
    parts = attr.split('.')
    current = obj
    
    for part in parts[:-1]:
        if current is None:
            return False
        if hasattr(current, part):
            current = getattr(current, part)
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return False
    
    final_part = parts[-1]
    
    try:
        if hasattr(current, final_part):
            setattr(current, final_part, value)
        elif isinstance(current, dict):
            current[final_part] = value
        else:
            return False
        return True
    except Exception:
        return False


def merge_dicts(*dicts: Dict[Any, Any], deep: bool = False) -> Dict[Any, Any]:
    """
    Merge multiple dictionaries.
    
    Args:
        *dicts: Dictionaries to merge
        deep: Whether to do deep merge
        
    Returns:
        Dict: Merged dictionary
    """
    result = {}
    for d in dicts:
        if not d:
            continue
        if deep:
            for key, value in d.items():
                if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                    result[key] = merge_dicts(result[key], value, deep=True)
                else:
                    result[key] = value
        else:
            result.update(d)
    return result


def pick_keys(data: Dict[Any, Any], keys: List[Any], default: Any = None) -> Dict[Any, Any]:
    """
    Pick specific keys from a dictionary.
    
    Args:
        data: Source dictionary
        keys: Keys to pick
        default: Default value for missing keys
        
    Returns:
        Dict: Dictionary with picked keys
    """
    return {key: data.get(key, default) for key in keys}


def omit_keys(data: Dict[Any, Any], keys: List[Any]) -> Dict[Any, Any]:
    """
    Omit specific keys from a dictionary.
    
    Args:
        data: Source dictionary
        keys: Keys to omit
        
    Returns:
        Dict: Dictionary without omitted keys
    """
    return {key: value for key, value in data.items() if key not in keys}


def flatten_dict(data: Dict[Any, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """
    Flatten a nested dictionary.
    
    Args:
        data: Dictionary to flatten
        parent_key: Parent key for nesting
        sep: Separator for keys
        
    Returns:
        Dict: Flattened dictionary
    """
    items = []
    for key, value in data.items():
        new_key = f"{parent_key}{sep}{key}" if parent_key else key
        if isinstance(value, dict):
            items.extend(flatten_dict(value, new_key, sep=sep).items())
        else:
            items.append((new_key, value))
    return dict(items)


def unflatten_dict(data: Dict[Any, Any], sep: str = '.') -> Dict[Any, Any]:
    """
    Unflatten a dictionary.
    
    Args:
        data: Flattened dictionary
        sep: Separator for keys
        
    Returns:
        Dict: Nested dictionary
    """
    result = {}
    for key, value in data.items():
        parts = key.split(sep)
        current = result
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
    return result


# ============================================================================
# Collection Helpers
# ============================================================================

def chunk_list(lst: List[T], size: int) -> List[List[T]]:
    """
    Split a list into chunks of specified size.
    
    Args:
        lst: List to chunk
        size: Chunk size
        
    Returns:
        List[List[T]]: List of chunks
    """
    if size <= 0:
        return [lst]
    return [lst[i:i + size] for i in range(0, len(lst), size)]


def unique_list(lst: List[T], key: Optional[Callable] = None) -> List[T]:
    """
    Get unique elements from a list while preserving order.
    
    Args:
        lst: List to deduplicate
        key: Function to extract key for comparison
        
    Returns:
        List[T]: List with duplicates removed
    """
    seen = set()
    result = []
    
    for item in lst:
        item_key = key(item) if key else item
        if item_key not in seen:
            seen.add(item_key)
            result.append(item)
    
    return result


def group_by(items: List[Dict[Any, Any]], key: Union[str, Callable]) -> Dict[Any, List[Any]]:
    """
    Group items by a key.
    
    Args:
        items: List of items to group
        key: Key to group by (string for dict key or callable)
        
    Returns:
        Dict: Grouped items
    """
    result = {}
    
    for item in items:
        if isinstance(key, str):
            group_key = item.get(key)
        else:
            group_key = key(item)
        
        if group_key not in result:
            result[group_key] = []
        result[group_key].append(item)
    
    return result


def sort_by(items: List[Dict[Any, Any]], key: Union[str, Callable], reverse: bool = False) -> List[Dict[Any, Any]]:
    """
    Sort items by a key.
    
    Args:
        items: List to sort
        key: Key to sort by (string for dict key or callable)
        reverse: Sort in reverse order
        
    Returns:
        List: Sorted list
    """
    if isinstance(key, str):
        return sorted(items, key=lambda x: x.get(key), reverse=reverse)
    return sorted(items, key=key, reverse=reverse)


def find_in_list(lst: List[Any], predicate: Callable[[Any], bool]) -> Optional[Any]:
    """
    Find first item matching predicate.
    
    Args:
        lst: List to search
        predicate: Predicate function
        
    Returns:
        Optional[Any]: Found item or None
    """
    for item in lst:
        if predicate(item):
            return item
    return None


def find_index(lst: List[Any], predicate: Callable[[Any], bool]) -> int:
    """
    Find index of first item matching predicate.
    
    Args:
        lst: List to search
        predicate: Predicate function
        
    Returns:
        int: Index of found item or -1
    """
    for i, item in enumerate(lst):
        if predicate(item):
            return i
    return -1


def partition_list(lst: List[T], predicate: Callable[[T], bool]) -> Tuple[List[T], List[T]]:
    """
    Partition a list into two lists based on predicate.
    
    Args:
        lst: List to partition
        predicate: Predicate function
        
    Returns:
        Tuple[List[T], List[T]]: (True list, False list)
    """
    true_list = []
    false_list = []
    
    for item in lst:
        if predicate(item):
            true_list.append(item)
        else:
            false_list.append(item)
    
    return true_list, false_list


# ============================================================================
# Time Helpers
# ============================================================================

def timeit(func: Callable) -> Callable:
    """
    Decorator to measure function execution time.
    
    Args:
        func: Function to time
        
    Returns:
        Callable: Wrapped function
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        wrapper.last_duration = elapsed
        return result
    wrapper.last_duration = 0
    return wrapper


@contextmanager
def measure_time(operation: str = "operation") -> Generator[float, None, None]:
    """
    Context manager to measure execution time.
    
    Args:
        operation: Operation name for logging
        
    Yields:
        float: Start time
    """
    start = time.time()
    try:
        yield start
    finally:
        elapsed = time.time() - start
        # Optional: Log elapsed time
        pass


def humanize_time(seconds: float) -> str:
    """
    Convert seconds to human-readable format.
    
    Args:
        seconds: Number of seconds
        
    Returns:
        str: Human-readable time string
    """
    if seconds < 0:
        return "0 seconds"
    
    units = [
        (86400, "day"),
        (3600, "hour"),
        (60, "minute"),
        (1, "second")
    ]
    
    parts = []
    for unit_size, unit_name in units:
        if seconds >= unit_size:
            count = int(seconds // unit_size)
            seconds -= count * unit_size
            parts.append(f"{count} {unit_name}{'s' if count != 1 else ''}")
    
    if not parts:
        return "0 seconds"
    
    if len(parts) == 1:
        return parts[0]
    
    return ", ".join(parts[:-1]) + " and " + parts[-1]


def time_from_now(days: int = 0, hours: int = 0, minutes: int = 0, seconds: int = 0) -> datetime:
    """
    Get datetime from now plus offset.
    
    Args:
        days: Days to add
        hours: Hours to add
        minutes: Minutes to add
        seconds: Seconds to add
        
    Returns:
        datetime: Future datetime
    """
    return utc_now() + timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds)


def time_ago_from(dt: datetime) -> str:
    """
    Get human-readable time ago from datetime.
    
    Args:
        dt: Datetime to compare
        
    Returns:
        str: Human-readable time ago
    """
    from .datetime_utils import time_ago
    return time_ago(dt)


# ============================================================================
# File System Helpers
# ============================================================================

def ensure_directory(path: str) -> bool:
    """
    Ensure directory exists, create if not.
    
    Args:
        path: Directory path
        
    Returns:
        bool: True if directory exists/created
    """
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except Exception:
        return False


def get_file_size_bytes(file_path: str) -> int:
    """
    Get file size in bytes.
    
    Args:
        file_path: Path to file
        
    Returns:
        int: File size in bytes
    """
    try:
        return os.path.getsize(file_path)
    except Exception:
        return 0


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        str: Human-readable file size
    """
    if size_bytes == 0:
        return "0 B"
    
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    size = size_bytes / math.pow(1024, i)
    
    return f"{size:.2f} {units[i]}"


def get_file_extension(file_path: str) -> str:
    """
    Get file extension from path.
    
    Args:
        file_path: File path
        
    Returns:
        str: File extension (without dot)
    """
    return os.path.splitext(file_path)[1].lower().lstrip('.')


# ============================================================================
# Network Helpers
# ============================================================================

def is_valid_url(url: str) -> bool:
    """
    Check if URL is valid.
    
    Args:
        url: URL to check
        
    Returns:
        bool: True if valid
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def parse_url_params(url: str) -> Dict[str, Union[str, List[str]]]:
    """
    Parse URL parameters.
    
    Args:
        url: URL to parse
        
    Returns:
        Dict: URL parameters
    """
    parsed = urlparse(url)
    return parse_qs(parsed.query)


def build_url(base: str, path: str = "", params: Optional[Dict[str, Any]] = None) -> str:
    """
    Build URL from components.
    
    Args:
        base: Base URL
        path: URL path
        params: Query parameters
        
    Returns:
        str: Constructed URL
    """
    parsed = urlparse(base)
    path = parsed.path.rstrip('/') + '/' + path.lstrip('/')
    
    query_params = parse_qs(parsed.query)
    if params:
        for key, value in params.items():
            if isinstance(value, list):
                query_params[key] = value
            else:
                query_params[key] = [str(value)]
    
    query = urlencode(query_params, doseq=True)
    
    return urlunparse((
        parsed.scheme,
        parsed.netloc,
        path,
        parsed.params,
        query,
        parsed.fragment
    ))


# ============================================================================
# Random Helpers
# ============================================================================

def random_string(length: int = 8, chars: str = string.ascii_letters + string.digits) -> str:
    """
    Generate random string.
    
    Args:
        length: String length
        chars: Characters to use
        
    Returns:
        str: Random string
    """
    return ''.join(random.choice(chars) for _ in range(length))


def random_hex(length: int = 16) -> str:
    """
    Generate random hex string.
    
    Args:
        length: String length
        
    Returns:
        str: Random hex string
    """
    return random_string(length, string.hexdigits)


def random_int(min_value: int = 0, max_value: int = 100) -> int:
    """
    Generate random integer.
    
    Args:
        min_value: Minimum value
        max_value: Maximum value
        
    Returns:
        int: Random integer
    """
    return random.randint(min_value, max_value)


def random_float(min_value: float = 0.0, max_value: float = 1.0) -> float:
    """
    Generate random float.
    
    Args:
        min_value: Minimum value
        max_value: Maximum value
        
    Returns:
        float: Random float
    """
    return random.uniform(min_value, max_value)


def random_choice(items: List[T]) -> T:
    """
    Pick random item from list.
    
    Args:
        items: List of items
        
    Returns:
        T: Random item
    """
    return random.choice(items)


def random_sample(items: List[T], size: int) -> List[T]:
    """
    Pick random sample from list.
    
    Args:
        items: List of items
        size: Sample size
        
    Returns:
        List[T]: Random sample
    """
    return random.sample(items, min(size, len(items)))


def random_shuffle(items: List[T]) -> List[T]:
    """
    Shuffle list randomly.
    
    Args:
        items: List to shuffle
        
    Returns:
        List[T]: Shuffled list
    """
    result = items.copy()
    random.shuffle(result)
    return result


# ============================================================================
# Hash Helpers
# ============================================================================

def hash_md5(data: Union[str, bytes]) -> str:
    """
    Generate MD5 hash.
    
    Args:
        data: Data to hash
        
    Returns:
        str: MD5 hash
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.md5(data).hexdigest()


def hash_sha1(data: Union[str, bytes]) -> str:
    """
    Generate SHA1 hash.
    
    Args:
        data: Data to hash
        
    Returns:
        str: SHA1 hash
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha1(data).hexdigest()


def hash_sha256(data: Union[str, bytes]) -> str:
    """
    Generate SHA256 hash.
    
    Args:
        data: Data to hash
        
    Returns:
        str: SHA256 hash
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def hash_sha512(data: Union[str, bytes]) -> str:
    """
    Generate SHA512 hash.
    
    Args:
        data: Data to hash
        
    Returns:
        str: SHA512 hash
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha512(data).hexdigest()


def base64_encode(data: Union[str, bytes]) -> str:
    """
    Encode data to base64.
    
    Args:
        data: Data to encode
        
    Returns:
        str: Base64 encoded string
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.b64encode(data).decode('utf-8')


def base64_decode(data: str) -> str:
    """
    Decode base64 data.
    
    Args:
        data: Base64 encoded string
        
    Returns:
        str: Decoded string
    """
    return base64.b64decode(data).decode('utf-8')


# ============================================================================
# Validation Helpers
# ============================================================================

def is_empty(value: Any) -> bool:
    """
    Check if value is empty.
    
    Args:
        value: Value to check
        
    Returns:
        bool: True if empty
    """
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip()
    if isinstance(value, (list, dict, tuple, set)):
        return len(value) == 0
    return False


def is_blank(value: str) -> bool:
    """
    Check if string is blank (None, empty, or whitespace).
    
    Args:
        value: String to check
        
    Returns:
        bool: True if blank
    """
    return value is None or not value.strip()


def default_if_empty(value: Any, default: Any) -> Any:
    """
    Return default if value is empty.
    
    Args:
        value: Value to check
        default: Default value
        
    Returns:
        Any: Value or default
    """
    return default if is_empty(value) else value


def coalesce(*values: Any) -> Any:
    """
    Return first non-None value.
    
    Args:
        *values: Values to check
        
    Returns:
        Any: First non-None value
    """
    for value in values:
        if value is not None:
            return value
    return None


# ============================================================================
# Class and Object Helpers
# ============================================================================

def singleton(cls: Type[T]) -> Type[T]:
    """
    Singleton decorator for classes.
    
    Args:
        cls: Class to make singleton
        
    Returns:
        Type[T]: Singleton class
    """
    instances = {}
    
    @wraps(cls)
    def wrapper(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return wrapper


def memoize(func: Callable) -> Callable:
    """
    Memoization decorator.
    
    Args:
        func: Function to memoize
        
    Returns:
        Callable: Memoized function
    """
    cache = {}
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = (args, tuple(kwargs.items()))
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    
    return wrapper


def classproperty(func: Callable) -> property:
    """
    Class property decorator.
    
    Args:
        func: Function to make class property
        
    Returns:
        property: Class property
    """
    return property(classmethod(func))


# ============================================================================
# Context Managers
# ============================================================================

@contextmanager
def suppress(*exceptions: Type[Exception]) -> Generator[None, None, None]:
    """
    Context manager to suppress exceptions.
    
    Args:
        *exceptions: Exception types to suppress
    """
    try:
        yield
    except exceptions:
        pass


@contextmanager
def timeout_context(seconds: int) -> Generator[None, None, None]:
    """
    Context manager to timeout operations.
    
    Args:
        seconds: Timeout in seconds
        
    Raises:
        TimeoutError: If operation exceeds timeout
    """
    import signal
    
    def timeout_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    # Set timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        signal.alarm(0)


@contextmanager
def temp_env_var(key: str, value: str) -> Generator[None, None, None]:
    """
    Temporarily set environment variable.
    
    Args:
        key: Environment variable key
        value: Environment variable value
    """
    old_value = os.environ.get(key)
    os.environ[key] = value
    try:
        yield
    finally:
        if old_value is None:
            del os.environ[key]
        else:
            os.environ[key] = old_value


# ============================================================================
# Import Helpers
# ============================================================================

def import_string(path: str) -> Any:
    """
    Import a string path to a module/class/function.
    
    Args:
        path: Import path (e.g., 'module.submodule.Class')
        
    Returns:
        Any: Imported object
    """
    parts = path.split('.')
    module_path = '.'.join(parts[:-1])
    object_name = parts[-1]
    
    module = __import__(module_path, fromlist=[object_name])
    return getattr(module, object_name)


def import_module(path: str) -> Any:
    """
    Import a module by path.
    
    Args:
        path: Module path
        
    Returns:
        Any: Imported module
    """
    return __import__(path, fromlist=['*'])


# ============================================================================
# System Helpers
# ============================================================================

def get_environment() -> str:
    """
    Get current environment.
    
    Returns:
        str: Environment name (development, staging, production, testing)
    """
    return os.environ.get('ENVIRONMENT', 'development')


def is_development() -> bool:
    """Check if running in development environment."""
    return get_environment() == 'development'


def is_production() -> bool:
    """Check if running in production environment."""
    return get_environment() == 'production'


def is_testing() -> bool:
    """Check if running in testing environment."""
    return get_environment() == 'testing'


def is_staging() -> bool:
    """Check if running in staging environment."""
    return get_environment() == 'staging'


def get_hostname() -> str:
    """Get system hostname."""
    return os.uname().nodename if hasattr(os, 'uname') else 'unknown'


def get_pid() -> int:
    """Get current process ID."""
    return os.getpid()


# ============================================================================
# Helper Class
# ============================================================================

class Helpers:
    """
    Collection of helper methods.
    """
    
    @staticmethod
    def safe_cast(value: Any, target_type: type, default: Any = None) -> Any:
        return safe_cast(value, target_type, default)
    
    @staticmethod
    def to_bool(value: Any) -> bool:
        return to_bool(value)
    
    @staticmethod
    def to_int(value: Any, default: int = 0) -> int:
        return to_int(value, default)
    
    @staticmethod
    def to_float(value: Any, default: float = 0.0) -> float:
        return to_float(value, default)
    
    @staticmethod
    def to_decimal(value: Any, default: Optional[Decimal] = None) -> Optional[Decimal]:
        return to_decimal(value, default)
    
    @staticmethod
    def to_str(value: Any, default: str = "") -> str:
        return to_str(value, default)
    
    @staticmethod
    def to_json(value: Any, default: Any = None) -> Any:
        return to_json(value, default)
    
    @staticmethod
    def from_json(value: Any, default: str = "{}") -> str:
        return from_json(value, default)
    
    @staticmethod
    def merge_dicts(*dicts: Dict[Any, Any], deep: bool = False) -> Dict[Any, Any]:
        return merge_dicts(*dicts, deep=deep)
    
    @staticmethod
    def pick_keys(data: Dict[Any, Any], keys: List[Any], default: Any = None) -> Dict[Any, Any]:
        return pick_keys(data, keys, default)
    
    @staticmethod
    def omit_keys(data: Dict[Any, Any], keys: List[Any]) -> Dict[Any, Any]:
        return omit_keys(data, keys)
    
    @staticmethod
    def chunk_list(lst: List[T], size: int) -> List[List[T]]:
        return chunk_list(lst, size)
    
    @staticmethod
    def unique_list(lst: List[T], key: Optional[Callable] = None) -> List[T]:
        return unique_list(lst, key)
    
    @staticmethod
    def group_by(items: List[Dict[Any, Any]], key: Union[str, Callable]) -> Dict[Any, List[Any]]:
        return group_by(items, key)
    
    @staticmethod
    def sort_by(items: List[Dict[Any, Any]], key: Union[str, Callable], reverse: bool = False) -> List[Dict[Any, Any]]:
        return sort_by(items, key, reverse)
    
    @staticmethod
    def humanize_time(seconds: float) -> str:
        return humanize_time(seconds)
    
    @staticmethod
    def format_file_size(size_bytes: int) -> str:
        return format_file_size(size_bytes)
    
    @staticmethod
    def random_string(length: int = 8) -> str:
        return random_string(length)
    
    @staticmethod
    def random_hex(length: int = 16) -> str:
        return random_hex(length)
    
    @staticmethod
    def random_int(min_value: int = 0, max_value: int = 100) -> int:
        return random_int(min_value, max_value)
    
    @staticmethod
    def random_float(min_value: float = 0.0, max_value: float = 1.0) -> float:
        return random_float(min_value, max_value)
    
    @staticmethod
    def random_choice(items: List[T]) -> T:
        return random_choice(items)
    
    @staticmethod
    def hash_md5(data: Union[str, bytes]) -> str:
        return hash_md5(data)
    
    @staticmethod
    def hash_sha256(data: Union[str, bytes]) -> str:
        return hash_sha256(data)
    
    @staticmethod
    def base64_encode(data: Union[str, bytes]) -> str:
        return base64_encode(data)
    
    @staticmethod
    def base64_decode(data: str) -> str:
        return base64_decode(data)
    
    @staticmethod
    def is_empty(value: Any) -> bool:
        return is_empty(value)
    
    @staticmethod
    def is_blank(value: str) -> bool:
        return is_blank(value)
    
    @staticmethod
    def default_if_empty(value: Any, default: Any) -> Any:
        return default_if_empty(value, default)
    
    @staticmethod
    def coalesce(*values: Any) -> Any:
        return coalesce(*values)
    
    @staticmethod
    def import_string(path: str) -> Any:
        return import_string(path)
    
    @staticmethod
    def get_environment() -> str:
        return get_environment()
    
    @staticmethod
    def is_development() -> bool:
        return is_development()
    
    @staticmethod
    def is_production() -> bool:
        return is_production()
    
    @staticmethod
    def is_testing() -> bool:
        return is_testing()
    
    @staticmethod
    def is_staging() -> bool:
        return is_staging()


# ============================================================================
# Module Exports
# ============================================================================

__all__ = [
    # Data Conversion
    'safe_cast',
    'to_bool',
    'to_int',
    'to_float',
    'to_decimal',
    'to_str',
    'to_json',
    'from_json',
    
    # Object Helpers
    'get_attr_safe',
    'set_attr_safe',
    'merge_dicts',
    'pick_keys',
    'omit_keys',
    'flatten_dict',
    'unflatten_dict',
    
    # Collection Helpers
    'chunk_list',
    'unique_list',
    'group_by',
    'sort_by',
    'find_in_list',
    'find_index',
    'partition_list',
    
    # Time Helpers
    'timeit',
    'measure_time',
    'humanize_time',
    'time_from_now',
    'time_ago_from',
    
    # File System Helpers
    'ensure_directory',
    'get_file_size_bytes',
    'format_file_size',
    'get_file_extension',
    
    # Network Helpers
    'is_valid_url',
    'parse_url_params',
    'build_url',
    
    # Random Helpers
    'random_string',
    'random_hex',
    'random_int',
    'random_float',
    'random_choice',
    'random_sample',
    'random_shuffle',
    
    # Hash Helpers
    'hash_md5',
    'hash_sha1',
    'hash_sha256',
    'hash_sha512',
    'base64_encode',
    'base64_decode',
    
    # Validation Helpers
    'is_empty',
    'is_blank',
    'default_if_empty',
    'coalesce',
    
    # Class and Object Helpers
    'singleton',
    'memoize',
    'classproperty',
    
    # Context Managers
    'suppress',
    'timeout_context',
    'temp_env_var',
    
    # Import Helpers
    'import_string',
    'import_module',
    
    # System Helpers
    'get_environment',
    'is_development',
    'is_production',
    'is_testing',
    'is_staging',
    'get_hostname',
    'get_pid',
    
    # Helper Class
    'Helpers',
]