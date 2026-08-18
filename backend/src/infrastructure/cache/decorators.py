# ============================================================================
# Cache Decorators
# ============================================================================

"""
Cache decorators for automatic caching of function results.
"""

from typing import Optional, Any, Callable, Dict, Union
from functools import wraps
import hashlib
import json
import inspect

from src.infrastructure.cache.client import CacheClient
from src.infrastructure.cache.manager import CacheManager


def cached(
    ttl: Optional[int] = None,
    key_template: Optional[str] = None,
    namespace: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
):
    """
    Decorator to cache function results.
    
    Args:
        ttl: Time to live in seconds
        key_template: Template for cache key
        namespace: Cache namespace
        cache_manager: Cache manager instance
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get cache manager
            cm = cache_manager or CacheManager.get_default()
            
            # Generate cache key
            cache_key = generate_cache_key(func, args, kwargs, key_template)
            
            # Add namespace
            if namespace:
                cache_key = f"{namespace}:{cache_key}"
            
            # Try to get from cache
            cached_value = await cm.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            if result is not None:
                await cm.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def cache_invalidate(
    key_template: Optional[str] = None,
    namespace: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
    pattern: bool = False,
):
    """
    Decorator to invalidate cache after function execution.
    
    Args:
        key_template: Template for cache key
        namespace: Cache namespace
        cache_manager: Cache manager instance
        pattern: Whether to use pattern matching
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute function
            result = await func(*args, **kwargs)
            
            # Get cache manager
            cm = cache_manager or CacheManager.get_default()
            
            # Generate cache key
            cache_key = generate_cache_key(func, args, kwargs, key_template)
            
            # Add namespace
            if namespace:
                cache_key = f"{namespace}:{cache_key}"
            
            # Invalidate cache
            if pattern:
                await cm.invalidate_pattern(cache_key)
            else:
                await cm.delete(cache_key)
            
            return result
        
        return wrapper
    return decorator


def cache_evict(
    key_template: Optional[str] = None,
    namespace: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
):
    """
    Decorator to evict cache before function execution.
    
    Args:
        key_template: Template for cache key
        namespace: Cache namespace
        cache_manager: Cache manager instance
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get cache manager
            cm = cache_manager or CacheManager.get_default()
            
            # Generate cache key
            cache_key = generate_cache_key(func, args, kwargs, key_template)
            
            # Add namespace
            if namespace:
                cache_key = f"{namespace}:{cache_key}"
            
            # Evict cache
            await cm.delete(cache_key)
            
            # Execute function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def cache_put(
    ttl: Optional[int] = None,
    key_template: Optional[str] = None,
    namespace: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
):
    """
    Decorator to manually put result in cache.
    
    Args:
        ttl: Time to live in seconds
        key_template: Template for cache key
        namespace: Cache namespace
        cache_manager: Cache manager instance
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute function
            result = await func(*args, **kwargs)
            
            # Get cache manager
            cm = cache_manager or CacheManager.get_default()
            
            # Generate cache key
            cache_key = generate_cache_key(func, args, kwargs, key_template)
            
            # Add namespace
            if namespace:
                cache_key = f"{namespace}:{cache_key}"
            
            # Cache result
            if result is not None:
                await cm.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def cache_async(
    ttl: Optional[int] = None,
    key_template: Optional[str] = None,
    namespace: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
):
    """
    Decorator for async functions with caching.
    
    Args:
        ttl: Time to live in seconds
        key_template: Template for cache key
        namespace: Cache namespace
        cache_manager: Cache manager instance
        
    Returns:
        Decorated function
    """
    return cached(ttl, key_template, namespace, cache_manager)


def generate_cache_key(
    func: Callable,
    args: tuple,
    kwargs: dict,
    key_template: Optional[str] = None,
) -> str:
    """
    Generate cache key for function call.
    
    Args:
        func: Function
        args: Positional arguments
        kwargs: Keyword arguments
        key_template: Template for cache key
        
    Returns:
        str: Cache key
    """
    if key_template:
        # Use template-based key generation
        return render_template(key_template, func, args, kwargs)
    
    # Use hash-based key generation
    key_data = {
        "function": f"{func.__module__}.{func.__name__}",
        "args": args,
        "kwargs": kwargs,
    }
    
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.sha256(key_str.encode()).hexdigest()[:32]


def render_template(
    template: str,
    func: Callable,
    args: tuple,
    kwargs: dict,
) -> str:
    """
    Render cache key template.
    
    Args:
        template: Template string
        func: Function
        args: Positional arguments
        kwargs: Keyword arguments
        
    Returns:
        str: Rendered template
    """
    # Get argument names
    sig = inspect.signature(func)
    param_names = list(sig.parameters.keys())
    
    # Map arguments to names
    arg_dict = {}
    for i, arg in enumerate(args):
        if i < len(param_names):
            arg_dict[param_names[i]] = arg
    
    # Add keyword arguments
    arg_dict.update(kwargs)
    
    # Add function name
    arg_dict["__function__"] = f"{func.__module__}.{func.__name__}"
    
    # Render template
    return template.format(**arg_dict)


class CacheKeyGenerator:
    """
    Utility for generating cache keys.
    """
    
    @staticmethod
    def simple(func_name: str, *args, **kwargs) -> str:
        """Generate simple cache key."""
        key_data = {
            "func": func_name,
            "args": args,
            "kwargs": kwargs,
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.sha256(key_str.encode()).hexdigest()[:32]
    
    @staticmethod
    def template(template: str, **kwargs) -> str:
        """Generate cache key from template."""
        return template.format(**kwargs)
    
    @staticmethod
    def hierarchical(parts: list) -> str:
        """Generate hierarchical cache key."""
        return ":".join(str(part) for part in parts)


class CacheKeyTemplate:
    """
    Cache key template with placeholders.
    """
    
    def __init__(self, template: str):
        self.template = template
    
    def render(self, **kwargs) -> str:
        """Render template with arguments."""
        return self.template.format(**kwargs)
    
    def render_with_func(self, func: Callable, *args, **kwargs) -> str:
        """Render template with function arguments."""
        # Get argument names
        sig = inspect.signature(func)
        param_names = list(sig.parameters.keys())
        
        # Map arguments to names
        arg_dict = {}
        for i, arg in enumerate(args):
            if i < len(param_names):
                arg_dict[param_names[i]] = arg
        
        # Add keyword arguments
        arg_dict.update(kwargs)
        
        # Add function name
        arg_dict["__function__"] = f"{func.__module__}.{func.__name__}"
        
        return self.template.format(**arg_dict)