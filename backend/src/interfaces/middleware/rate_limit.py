# ============================================================================
# Rate Limit Middleware
# ============================================================================

"""
Rate limiting middleware for API protection.

This module provides rate limiting functionality using Redis as the backend
store, with configurable limits per endpoint, user, and IP address.
"""

import time
import hashlib
import json
from typing import Dict, Optional, Tuple, List, Callable, Awaitable
from collections import defaultdict
from datetime import datetime, timedelta
from functools import wraps

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from src.infrastructure.redis_client import RedisClient
from src.config import settings
from src.utils.logger import logger


# ============================================================================
# Rate Limit Configuration
# ============================================================================

class RateLimitConfig:
    """Configuration for rate limiting."""
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        requests_per_day: int = 10000,
        burst_limit: int = 10,
        block_duration: int = 300,  # seconds
        path_prefixes: Optional[List[str]] = None,
        exempt_paths: Optional[List[str]] = None,
        exempt_ips: Optional[List[str]] = None,
        enabled: bool = True,
    ):
        """
        Initialize rate limit configuration.
        
        Args:
            requests_per_minute: Maximum requests per minute
            requests_per_hour: Maximum requests per hour
            requests_per_day: Maximum requests per day
            burst_limit: Maximum burst requests
            block_duration: Duration to block after limit exceeded (seconds)
            path_prefixes: Path prefixes to apply rate limiting to
            exempt_paths: Paths exempt from rate limiting
            exempt_ips: IP addresses exempt from rate limiting
            enabled: Whether rate limiting is enabled
        """
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
        self.burst_limit = burst_limit
        self.block_duration = block_duration
        self.path_prefixes = path_prefixes or []
        self.exempt_paths = exempt_paths or []
        self.exempt_ips = exempt_ips or []
        self.enabled = enabled


# ============================================================================
# Rate Limit Strategy
# ============================================================================

class RateLimitStrategy:
    """Rate limiting strategies."""
    
    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"
    LEAKY_BUCKET = "leaky_bucket"


class RateLimiter:
    """Rate limiter implementation using Redis."""
    
    def __init__(
        self,
        redis_client: Optional[RedisClient] = None,
        config: Optional[RateLimitConfig] = None,
        strategy: str = RateLimitStrategy.SLIDING_WINDOW,
    ):
        """
        Initialize rate limiter.
        
        Args:
            redis_client: Redis client instance
            config: Rate limit configuration
            strategy: Rate limiting strategy
        """
        self.redis_client = redis_client or RedisClient()
        self.config = config or RateLimitConfig()
        self.strategy = strategy
        self.key_prefix = "rate_limit"
        self.block_prefix = "rate_limit_block"
        
    async def check_rate_limit(
        self,
        client_id: str,
        endpoint: str,
        method: str = "GET",
        limit_config: Optional[RateLimitConfig] = None,
    ) -> Tuple[bool, Dict[str, any]]:
        """
        Check if request is within rate limits.
        
        Args:
            client_id: Client identifier (IP, user ID, etc.)
            endpoint: Endpoint path
            method: HTTP method
            limit_config: Optional specific configuration
            
        Returns:
            Tuple[bool, Dict]: (is_allowed, rate_limit_info)
        """
        if not self.config.enabled:
            return True, {"limited": False, "reason": "Rate limiting disabled"}
        
        # Check if client is blocked
        if await self.is_client_blocked(client_id):
            return False, {
                "limited": True,
                "reason": "Client is blocked",
                "block_duration": self.config.block_duration
            }
        
        # Get configuration
        config = limit_config or self.config
        
        # Check each limit type
        limits = [
            ("minute", config.requests_per_minute, 60),
            ("hour", config.requests_per_hour, 3600),
            ("day", config.requests_per_day, 86400),
        ]
        
        rate_limit_info = {
            "limited": False,
            "limits": {},
            "remaining": {},
            "reset_in": {},
        }
        
        # Check strategy-specific limits
        if self.strategy == RateLimitStrategy.SLIDING_WINDOW:
            is_allowed, info = await self._check_sliding_window(
                client_id, endpoint, method, config
            )
        elif self.strategy == RateLimitStrategy.TOKEN_BUCKET:
            is_allowed, info = await self._check_token_bucket(
                client_id, endpoint, method, config
            )
        elif self.strategy == RateLimitStrategy.LEAKY_BUCKET:
            is_allowed, info = await self._check_leaky_bucket(
                client_id, endpoint, method, config
            )
        else:  # FIXED_WINDOW
            is_allowed, info = await self._check_fixed_window(
                client_id, endpoint, method, config
            )
        
        if not is_allowed:
            # Block client if too many requests
            await self.block_client(client_id)
            
        return is_allowed, info
    
    async def _check_fixed_window(
        self,
        client_id: str,
        endpoint: str,
        method: str,
        config: RateLimitConfig,
    ) -> Tuple[bool, Dict[str, any]]:
        """Check rate limit using fixed window strategy."""
        info = {"limited": False}
        
        # Check each time window
        windows = [
            ("minute", 60, config.requests_per_minute),
            ("hour", 3600, config.requests_per_hour),
            ("day", 86400, config.requests_per_day),
        ]
        
        for window_name, window_seconds, limit in windows:
            key = self._get_window_key(client_id, endpoint, method, window_name)
            
            # Get current count
            current = await self.redis_client.get(key) or 0
            current = int(current)
            
            if current >= limit:
                # Get remaining time in window
                ttl = await self.redis_client.ttl(key)
                if ttl <= 0:
                    # Window expired, reset
                    await self.redis_client.delete(key)
                    current = 0
                else:
                    info["limited"] = True
                    info["limit_exceeded"] = window_name
                    info["limit"] = limit
                    info["current"] = current
                    info["reset_in"] = ttl
                    return False, info
            
            # Increment counter
            if current == 0:
                await self.redis_client.setex(key, window_seconds, 1)
            else:
                await self.redis_client.incr(key)
                
            info[f"{window_name}_limit"] = limit
            info[f"{window_name}_remaining"] = limit - (current + 1)
            info[f"{window_name}_reset_in"] = window_seconds
        
        return True, info
    
    async def _check_sliding_window(
        self,
        client_id: str,
        endpoint: str,
        method: str,
        config: RateLimitConfig,
    ) -> Tuple[bool, Dict[str, any]]:
        """Check rate limit using sliding window strategy."""
        info = {"limited": False}
        now = time.time()
        
        # Check each time window
        windows = [
            ("minute", 60, config.requests_per_minute),
            ("hour", 3600, config.requests_per_hour),
            ("day", 86400, config.requests_per_day),
        ]
        
        for window_name, window_seconds, limit in windows:
            key = self._get_sliding_key(client_id, endpoint, method, window_name)
            
            # Clean old entries
            cutoff = now - window_seconds
            await self.redis_client.zremrangebyscore(key, 0, cutoff)
            
            # Get current count
            current = await self.redis_client.zcard(key)
            
            if current >= limit:
                # Check if oldest request is still in window
                oldest = await self.redis_client.zrange(key, 0, 0, withscores=True)
                if oldest:
                    oldest_time = oldest[0][1]
                    if now - oldest_time < window_seconds:
                        info["limited"] = True
                        info["limit_exceeded"] = window_name
                        info["limit"] = limit
                        info["current"] = current
                        info["reset_in"] = window_seconds - (now - oldest_time)
                        return False, info
            
            # Add current request
            await self.redis_client.zadd(key, {str(now): now})
            
            # Set expiration
            await self.redis_client.expire(key, window_seconds + 60)
            
            info[f"{window_name}_limit"] = limit
            info[f"{window_name}_remaining"] = limit - (current + 1)
            info[f"{window_name}_reset_in"] = window_seconds
        
        return True, info
    
    async def _check_token_bucket(
        self,
        client_id: str,
        endpoint: str,
        method: str,
        config: RateLimitConfig,
    ) -> Tuple[bool, Dict[str, any]]:
        """Check rate limit using token bucket strategy."""
        info = {"limited": False}
        
        bucket_key = self._get_bucket_key(client_id, endpoint, method)
        
        # Get bucket state
        bucket_data = await self.redis_client.get(bucket_key)
        if bucket_data:
            bucket = json.loads(bucket_data)
            tokens = bucket.get("tokens", config.burst_limit)
            last_refill = bucket.get("last_refill", time.time())
        else:
            tokens = config.burst_limit
            last_refill = time.time()
        
        # Refill tokens
        now = time.time()
        time_passed = now - last_refill
        refill_rate = config.burst_limit / 60  # tokens per second
        
        new_tokens = min(
            config.burst_limit,
            tokens + (time_passed * refill_rate)
        )
        
        # Check if enough tokens
        if new_tokens < 1:
            info["limited"] = True
            info["reason"] = "Insufficient tokens"
            info["tokens"] = new_tokens
            info["reset_in"] = 60 - (time_passed % 60)
            return False, info
        
        # Use token
        new_tokens -= 1
        
        # Save bucket state
        await self.redis_client.setex(
            bucket_key,
            60 * 60,  # 1 hour
            json.dumps({
                "tokens": new_tokens,
                "last_refill": now
            })
        )
        
        info["tokens"] = new_tokens
        info["capacity"] = config.burst_limit
        info["refill_rate"] = refill_rate
        
        return True, info
    
    async def _check_leaky_bucket(
        self,
        client_id: str,
        endpoint: str,
        method: str,
        config: RateLimitConfig,
    ) -> Tuple[bool, Dict[str, any]]:
        """Check rate limit using leaky bucket strategy."""
        info = {"limited": False}
        
        bucket_key = self._get_leaky_key(client_id, endpoint, method)
        
        # Get bucket state
        bucket_data = await self.redis_client.get(bucket_key)
        if bucket_data:
            bucket = json.loads(bucket_data)
            queue = bucket.get("queue", [])
            last_leak = bucket.get("last_leak", time.time())
        else:
            queue = []
            last_leak = time.time()
        
        # Leak requests
        now = time.time()
        leak_rate = config.requests_per_minute / 60  # requests per second
        leak_count = int((now - last_leak) * leak_rate)
        
        if leak_count > 0:
            queue = queue[leak_count:]
            last_leak = now
        
        # Check if bucket is full
        if len(queue) >= config.burst_limit:
            info["limited"] = True
            info["reason"] = "Bucket is full"
            info["queue_size"] = len(queue)
            info["capacity"] = config.burst_limit
            info["reset_in"] = len(queue) / leak_rate
            return False, info
        
        # Add request to queue
        queue.append(now)
        
        # Save bucket state
        await self.redis_client.setex(
            bucket_key,
            60 * 60,  # 1 hour
            json.dumps({
                "queue": queue,
                "last_leak": last_leak
            })
        )
        
        info["queue_size"] = len(queue)
        info["capacity"] = config.burst_limit
        info["leak_rate"] = leak_rate
        
        return True, info
    
    async def is_client_blocked(self, client_id: str) -> bool:
        """
        Check if client is blocked.
        
        Args:
            client_id: Client identifier
            
        Returns:
            bool: True if blocked, False otherwise
        """
        block_key = f"{self.block_prefix}:{client_id}"
        return await self.redis_client.exists(block_key)
    
    async def block_client(self, client_id: str, duration: Optional[int] = None) -> None:
        """
        Block a client for a duration.
        
        Args:
            client_id: Client identifier
            duration: Block duration in seconds (default: from config)
        """
        duration = duration or self.config.block_duration
        block_key = f"{self.block_prefix}:{client_id}"
        await self.redis_client.setex(block_key, duration, "blocked")
        logger.warning(f"Client {client_id} blocked for {duration} seconds")
    
    async def unblock_client(self, client_id: str) -> None:
        """
        Unblock a client.
        
        Args:
            client_id: Client identifier
        """
        block_key = f"{self.block_prefix}:{client_id}"
        await self.redis_client.delete(block_key)
        logger.info(f"Client {client_id} unblocked")
    
    def _get_window_key(self, client_id: str, endpoint: str, method: str, window: str) -> str:
        """Get Redis key for fixed window."""
        return f"{self.key_prefix}:fixed:{client_id}:{method}:{endpoint}:{window}"
    
    def _get_sliding_key(self, client_id: str, endpoint: str, method: str, window: str) -> str:
        """Get Redis key for sliding window."""
        return f"{self.key_prefix}:sliding:{client_id}:{method}:{endpoint}:{window}"
    
    def _get_bucket_key(self, client_id: str, endpoint: str, method: str) -> str:
        """Get Redis key for token bucket."""
        return f"{self.key_prefix}:token:{client_id}:{method}:{endpoint}"
    
    def _get_leaky_key(self, client_id: str, endpoint: str, method: str) -> str:
        """Get Redis key for leaky bucket."""
        return f"{self.key_prefix}:leaky:{client_id}:{method}:{endpoint}"


# ============================================================================
# Rate Limit Middleware
# ============================================================================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        redis_client: Optional[RedisClient] = None,
        config: Optional[RateLimitConfig] = None,
        strategy: str = RateLimitStrategy.SLIDING_WINDOW,
        identifier_function: Optional[Callable] = None,
    ):
        """
        Initialize rate limit middleware.
        
        Args:
            app: ASGI application
            redis_client: Redis client instance
            config: Rate limit configuration
            strategy: Rate limiting strategy
            identifier_function: Function to get client identifier
        """
        super().__init__(app)
        self.rate_limiter = RateLimiter(redis_client, config, strategy)
        self.config = config or RateLimitConfig()
        self.identifier_function = identifier_function or self._default_identifier
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request with rate limiting.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            Response: HTTP response
        """
        # Check if rate limiting should be applied
        if not self._should_apply_rate_limit(request):
            return await call_next(request)
        
        # Get client identifier
        client_id = await self.identifier_function(request)
        
        # Check rate limit
        is_allowed, rate_limit_info = await self.rate_limiter.check_rate_limit(
            client_id=client_id,
            endpoint=request.url.path,
            method=request.method,
        )
        
        # Add rate limit headers
        response = None
        
        if not is_allowed:
            # Rate limit exceeded
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": "Too many requests. Please try again later.",
                    "limit_info": rate_limit_info
                },
                headers=self._get_rate_limit_headers(rate_limit_info)
            )
        else:
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers to response
            if isinstance(response, Response):
                for key, value in self._get_rate_limit_headers(rate_limit_info).items():
                    response.headers[key] = value
        
        return response
    
    def _should_apply_rate_limit(self, request: Request) -> bool:
        """
        Determine if rate limiting should be applied.
        
        Args:
            request: HTTP request
            
        Returns:
            bool: True if rate limiting should be applied
        """
        if not self.config.enabled:
            return False
        
        path = request.url.path
        
        # Check exempt paths
        for exempt_path in self.config.exempt_paths:
            if path.startswith(exempt_path):
                return False
        
        # Check path prefixes
        if self.config.path_prefixes:
            for prefix in self.config.path_prefixes:
                if path.startswith(prefix):
                    return True
            return False
        
        # Check exempt IPs
        client_ip = self._get_client_ip(request)
        if client_ip in self.config.exempt_ips:
            return False
        
        return True
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address."""
        # Check for forwarded headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        if request.client:
            return request.client.host
        
        return "unknown"
    
    async def _default_identifier(self, request: Request) -> str:
        """
        Default client identifier function.
        
        Args:
            request: HTTP request
            
        Returns:
            str: Client identifier
        """
        # Try to get user ID from request state
        if hasattr(request.state, "user_id"):
            return f"user:{request.state.user_id}"
        
        # Fallback to IP address
        return f"ip:{self._get_client_ip(request)}"
    
    def _get_rate_limit_headers(self, rate_limit_info: Dict) -> Dict[str, str]:
        """Get rate limit headers."""
        headers = {}
        
        # Extract limit and remaining for each window
        for window in ["minute", "hour", "day"]:
            limit_key = f"{window}_limit"
            remaining_key = f"{window}_remaining"
            reset_key = f"{window}_reset_in"
            
            if limit_key in rate_limit_info:
                headers[f"X-RateLimit-Limit-{window.upper()}"] = str(
                    rate_limit_info[limit_key]
                )
            if remaining_key in rate_limit_info:
                headers[f"X-RateLimit-Remaining-{window.upper()}"] = str(
                    rate_limit_info[remaining_key]
                )
            if reset_key in rate_limit_info:
                headers[f"X-RateLimit-Reset-{window.upper()}"] = str(
                    int(time.time() + rate_limit_info[reset_key])
                )
        
        # Retry-After header if limited
        if rate_limit_info.get("limited"):
            reset_in = rate_limit_info.get("reset_in", 60)
            headers["Retry-After"] = str(int(reset_in))
        
        return headers


# ============================================================================
# Decorator for Route Rate Limiting
# ============================================================================

def rate_limit(
    requests_per_minute: Optional[int] = None,
    requests_per_hour: Optional[int] = None,
    requests_per_day: Optional[int] = None,
    burst_limit: Optional[int] = None,
    strategy: str = RateLimitStrategy.SLIDING_WINDOW,
    block_duration: int = 300,
    identifier_key: Optional[str] = None,
):
    """
    Decorator for route-specific rate limiting.
    
    Args:
        requests_per_minute: Maximum requests per minute
        requests_per_hour: Maximum requests per hour
        requests_per_day: Maximum requests per day
        burst_limit: Maximum burst requests
        strategy: Rate limiting strategy
        block_duration: Duration to block after limit exceeded
        identifier_key: Key to use for client identification
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request from args or kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                for key, value in kwargs.items():
                    if isinstance(value, Request):
                        request = value
                        break
            
            if not request:
                # No request found, skip rate limiting
                return await func(*args, **kwargs)
            
            # Get client ID
            if identifier_key:
                client_id = request.path_params.get(identifier_key) or "unknown"
            else:
                client_id = f"ip:{request.client.host if request.client else 'unknown'}"
            
            # Create config
            config = RateLimitConfig(
                requests_per_minute=requests_per_minute or 60,
                requests_per_hour=requests_per_hour or 1000,
                requests_per_day=requests_per_day or 10000,
                burst_limit=burst_limit or 10,
                block_duration=block_duration,
                enabled=True,
            )
            
            # Create rate limiter
            rate_limiter = RateLimiter(
                redis_client=RedisClient(),
                config=config,
                strategy=strategy,
            )
            
            # Check rate limit
            is_allowed, rate_limit_info = await rate_limiter.check_rate_limit(
                client_id=client_id,
                endpoint=request.url.path,
                method=request.method,
            )
            
            if not is_allowed:
                # Add rate limit headers to response
                response = JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "Rate limit exceeded",
                        "detail": "Too many requests. Please try again later.",
                        "limit_info": rate_limit_info
                    },
                    headers={
                        "Retry-After": str(rate_limit_info.get("reset_in", 60)),
                    }
                )
                return response
            
            # Execute function
            response = await func(*args, **kwargs)
            
            # Add rate limit headers to response
            if isinstance(response, Response):
                response.headers["X-RateLimit-Limit-Minute"] = str(
                    config.requests_per_minute
                )
                response.headers["X-RateLimit-Remaining-Minute"] = str(
                    rate_limit_info.get("remaining", config.requests_per_minute)
                )
                response.headers["X-RateLimit-Reset-Minute"] = str(
                    int(time.time() + 60)
                )
            
            return response
        return wrapper
    return decorator


# ============================================================================
# Rate Limit Exemption Middleware
# ============================================================================

class RateLimitExemptMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add rate limit exemption based on headers or conditions.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        exempt_headers: Optional[List[str]] = None,
        exempt_condition: Optional[Callable] = None,
    ):
        """
        Initialize rate limit exemption middleware.
        
        Args:
            app: ASGI application
            exempt_headers: Headers that indicate exemption
            exempt_condition: Function to check exemption condition
        """
        super().__init__(app)
        self.exempt_headers = exempt_headers or ["X-Internal-Key", "X-Admin-Key"]
        self.exempt_condition = exempt_condition
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request with rate limit exemption.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            Response: HTTP response
        """
        # Check if request should be exempted
        if self._is_exempt(request):
            # Add header to indicate exemption
            request.state.rate_limit_exempt = True
        
        return await call_next(request)
    
    def _is_exempt(self, request: Request) -> bool:
        """
        Check if request should be exempted from rate limiting.
        
        Args:
            request: HTTP request
            
        Returns:
            bool: True if exempted
        """
        # Check exempt headers
        for header in self.exempt_headers:
            if request.headers.get(header):
                return True
        
        # Check exempt condition
        if self.exempt_condition and self.exempt_condition(request):
            return True
        
        return False


# ============================================================================
# Rate Limit Report Middleware
# ============================================================================

class RateLimitReportMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log rate limit metrics and alerts.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        threshold_percentage: float = 80.0,
        alert_function: Optional[Callable] = None,
    ):
        """
        Initialize rate limit report middleware.
        
        Args:
            app: ASGI application
            threshold_percentage: Percentage threshold for alerts
            alert_function: Function to call for alerts
        """
        super().__init__(app)
        self.threshold_percentage = threshold_percentage
        self.alert_function = alert_function or self._default_alert
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request with rate limit reporting.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            Response: HTTP response
        """
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Get rate limit headers
        remaining = int(response.headers.get("X-RateLimit-Remaining", "0"))
        limit = int(response.headers.get("X-RateLimit-Limit", "1"))
        
        # Calculate usage percentage
        if limit > 0:
            usage_percentage = (1 - (remaining / limit)) * 100
            
            # Check if threshold exceeded
            if usage_percentage >= self.threshold_percentage:
                await self.alert_function(
                    request=request,
                    usage_percentage=usage_percentage,
                    limit=limit,
                    remaining=remaining,
                )
            
            # Log rate limit metrics
            await self._log_metrics(
                request=request,
                usage_percentage=usage_percentage,
                limit=limit,
                remaining=remaining,
                duration=time.time() - start_time,
            )
        
        return response
    
    async def _default_alert(self, **kwargs) -> None:
        """Default alert function."""
        logger.warning(
            f"Rate limit threshold exceeded: {kwargs.get('usage_percentage', 0)}% "
            f"for {kwargs.get('request', {}).url.path if kwargs.get('request') else 'unknown'}"
        )
    
    async def _log_metrics(self, **kwargs) -> None:
        """Log rate limit metrics."""
        logger.info(
            f"Rate limit metrics: {kwargs.get('usage_percentage', 0)}% used, "
            f"{kwargs.get('remaining', 0)} remaining out of {kwargs.get('limit', 0)}, "
            f"duration: {kwargs.get('duration', 0):.3f}s"
        )


# ============================================================================
# Rate Limit Admin Functions
# ============================================================================

class RateLimitAdmin:
    """Administrative functions for rate limiting."""
    
    def __init__(self, redis_client: Optional[RedisClient] = None):
        """
        Initialize rate limit admin.
        
        Args:
            redis_client: Redis client instance
        """
        self.redis_client = redis_client or RedisClient()
    
    async def get_client_status(self, client_id: str) -> Dict[str, any]:
        """
        Get status for a specific client.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Dict: Client status information
        """
        # Check if blocked
        block_key = f"rate_limit_block:{client_id}"
        is_blocked = await self.redis_client.exists(block_key)
        
        block_ttl = 0
        if is_blocked:
            block_ttl = await self.redis_client.ttl(block_key)
        
        # Get rate limit keys
        pattern = f"rate_limit:*:{client_id}:*"
        keys = await self.redis_client.keys(pattern)
        
        limits = {}
        for key in keys:
            value = await self.redis_client.get(key)
            if value:
                limits[key] = value
        
        return {
            "client_id": client_id,
            "is_blocked": is_blocked,
            "block_ttl": block_ttl,
            "limits": limits,
        }
    
    async def reset_client_limits(self, client_id: str) -> int:
        """
        Reset rate limits for a client.
        
        Args:
            client_id: Client identifier
            
        Returns:
            int: Number of keys deleted
        """
        # Delete rate limit keys
        pattern = f"rate_limit:*:{client_id}:*"
        keys = await self.redis_client.keys(pattern)
        
        count = 0
        for key in keys:
            await self.redis_client.delete(key)
            count += 1
        
        # Unblock client
        await self.unblock_client(client_id)
        
        return count
    
    async def get_blocked_clients(self) -> List[Dict[str, any]]:
        """
        Get list of blocked clients.
        
        Returns:
            List[Dict]: List of blocked clients
        """
        pattern = "rate_limit_block:*"
        keys = await self.redis_client.keys(pattern)
        
        blocked_clients = []
        for key in keys:
            client_id = key.replace("rate_limit_block:", "")
            ttl = await self.redis_client.ttl(key)
            blocked_clients.append({
                "client_id": client_id,
                "blocked_until": datetime.now() + timedelta(seconds=ttl) if ttl > 0 else None,
                "ttl": ttl,
            })
        
        return blocked_clients
    
    async def clear_all_limits(self) -> int:
        """
        Clear all rate limits.
        
        Returns:
            int: Number of keys deleted
        """
        pattern = "rate_limit:*"
        keys = await self.redis_client.keys(pattern)
        
        count = 0
        for key in keys:
            await self.redis_client.delete(key)
            count += 1
        
        return count
    
    async def get_stats(self) -> Dict[str, any]:
        """
        Get rate limit statistics.
        
        Returns:
            Dict: Statistics
        """
        # Get all rate limit keys
        pattern = "rate_limit:*"
        keys = await self.redis_client.keys(pattern)
        
        total_keys = len(keys)
        
        # Count by type
        type_counts = defaultdict(int)
        for key in keys:
            parts = key.split(":")
            if len(parts) >= 2:
                type_counts[parts[1]] += 1
        
        # Get blocked clients
        blocked = await self.get_blocked_clients()
        
        return {
            "total_rate_limit_keys": total_keys,
            "keys_by_type": dict(type_counts),
            "blocked_clients": len(blocked),
            "blocked_clients_list": blocked,
            "timestamp": datetime.now().isoformat(),
        }


# ============================================================================
# Helper Functions
# ============================================================================

def create_rate_limit_config_from_settings() -> RateLimitConfig:
    """
    Create rate limit configuration from settings.
    
    Returns:
        RateLimitConfig: Rate limit configuration
    """
    return RateLimitConfig(
        requests_per_minute=settings.RATE_LIMIT_PER_MINUTE,
        requests_per_hour=settings.RATE_LIMIT_PER_HOUR,
        requests_per_day=settings.RATE_LIMIT_PER_DAY,
        burst_limit=settings.RATE_LIMIT_BURST,
        block_duration=settings.RATE_LIMIT_BLOCK_DURATION,
        path_prefixes=settings.RATE_LIMIT_PATH_PREFIXES,
        exempt_paths=settings.RATE_LIMIT_EXEMPT_PATHS,
        exempt_ips=settings.RATE_LIMIT_EXEMPT_IPS,
        enabled=settings.RATE_LIMIT_ENABLED,
    )


def get_rate_limiter() -> RateLimiter:
    """
    Get rate limiter instance.
    
    Returns:
        RateLimiter: Rate limiter instance
    """
    config = create_rate_limit_config_from_settings()
    return RateLimiter(
        redis_client=RedisClient(),
        config=config,
        strategy=settings.RATE_LIMIT_STRATEGY,
    )