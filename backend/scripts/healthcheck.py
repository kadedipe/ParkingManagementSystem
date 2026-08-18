#!/usr/bin/env python
# ============================================================================
# Health Check Script
# ============================================================================

"""
Health check script for the parking management system.

This script checks the health of various system components including
database, Redis, message queue, and external services.
"""

import os
import sys
import json
import time
import asyncio
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.shared.config import settings
from src.shared.logging import setup_logging, get_logger
from src.infrastructure.database import engine, get_db_session

# Setup logging
setup_logging()
logger = get_logger(__name__)


# ============================================================================
# Enums and Data Classes
# ============================================================================

class HealthStatus(str, Enum):
    """Health status enum."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class ServiceStatus(str, Enum):
    """Service status enum."""
    UP = "up"
    DOWN = "down"
    DEGRADED = "degraded"
    UNKNOWN = "unknown"


@dataclass
class HealthCheckResult:
    """Health check result for a service."""
    service: str
    status: ServiceStatus
    message: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    response_time: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class OverallHealth:
    """Overall health status."""
    status: HealthStatus
    services: List[HealthCheckResult]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    version: str = "1.0.0"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "status": self.status.value,
            "timestamp": self.timestamp,
            "version": self.version,
            "services": [
                {
                    "service": s.service,
                    "status": s.status.value,
                    "message": s.message,
                    "details": s.details,
                    "response_time": s.response_time,
                    "timestamp": s.timestamp,
                }
                for s in self.services
            ],
            "summary": self._get_summary()
        }
    
    def _get_summary(self) -> Dict[str, int]:
        """Get summary of service statuses."""
        summary = {status.value: 0 for status in ServiceStatus}
        for service in self.services:
            summary[service.status.value] += 1
        return summary


# ============================================================================
# Health Checkers
# ============================================================================

class BaseHealthChecker:
    """Base class for health checkers."""
    
    def __init__(self, name: str):
        """
        Initialize the health checker.
        
        Args:
            name: Name of the service
        """
        self.name = name
    
    async def check(self) -> HealthCheckResult:
        """
        Perform health check.
        
        Returns:
            HealthCheckResult: Health check result
        """
        start_time = time.time()
        try:
            result = await self._check()
            response_time = (time.time() - start_time) * 1000
            result.response_time = response_time
            return result
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DOWN,
                message=str(e),
                response_time=response_time
            )
    
    async def _check(self) -> HealthCheckResult:
        """
        Perform the actual health check.
        
        Returns:
            HealthCheckResult: Health check result
        """
        raise NotImplementedError("Subclasses must implement _check")


class DatabaseHealthChecker(BaseHealthChecker):
    """Health checker for database."""
    
    def __init__(self):
        super().__init__("database")
    
    async def _check(self) -> HealthCheckResult:
        """Check database health."""
        try:
            # Try to execute a simple query
            async with get_db_session() as session:
                from sqlalchemy import text
                result = await session.execute(text("SELECT 1"))
                row = result.fetchone()
                
                if row and row[0] == 1:
                    return HealthCheckResult(
                        service=self.name,
                        status=ServiceStatus.UP,
                        message="Database connection successful",
                        details={
                            "url": settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else "connected",
                            "pool_size": settings.DATABASE_POOL_SIZE,
                            "max_overflow": settings.DATABASE_MAX_OVERFLOW,
                        }
                    )
                else:
                    return HealthCheckResult(
                        service=self.name,
                        status=ServiceStatus.DOWN,
                        message="Database query failed"
                    )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DOWN,
                message=f"Database connection failed: {str(e)}"
            )


class RedisHealthChecker(BaseHealthChecker):
    """Health checker for Redis."""
    
    def __init__(self):
        super().__init__("redis")
    
    async def _check(self) -> HealthCheckResult:
        """Check Redis health."""
        try:
            import redis.asyncio as redis
            client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            
            # Ping Redis
            result = await client.ping()
            await client.close()
            
            if result:
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.UP,
                    message="Redis connection successful",
                    details={
                        "url": settings.REDIS_URL.split('@')[-1] if '@' in settings.REDIS_URL else "connected",
                        "db": settings.REDIS_DB,
                    }
                )
            else:
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.DOWN,
                    message="Redis ping failed"
                )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DOWN,
                message=f"Redis connection failed: {str(e)}"
            )


class MessageQueueHealthChecker(BaseHealthChecker):
    """Health checker for message queue."""
    
    def __init__(self):
        super().__init__("message_queue")
    
    async def _check(self) -> HealthCheckResult:
        """Check message queue health."""
        try:
            # Check if message bus is available
            from src.infrastructure.message_bus import MessageBus
            
            bus = MessageBus()
            await bus.start()
            
            # Try to publish a test message
            test_message = {
                "type": "healthcheck",
                "timestamp": datetime.utcnow().isoformat()
            }
            await bus.publish("healthcheck", test_message)
            
            await bus.stop()
            
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.UP,
                message="Message queue connection successful",
                details={
                    "queue_type": "Redis Pub/Sub",
                }
            )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DEGRADED,
                message=f"Message queue check failed: {str(e)}",
                details={
                    "error": str(e),
                    "impact": "Asynchronous operations may be delayed"
                }
            )


class CacheHealthChecker(BaseHealthChecker):
    """Health checker for cache."""
    
    def __init__(self):
        super().__init__("cache")
    
    async def _check(self) -> HealthCheckResult:
        """Check cache health."""
        try:
            from src.infrastructure.cache_service import CacheService
            from src.infrastructure.redis_client import RedisClient
            
            redis_client = RedisClient()
            cache = CacheService(redis_client)
            
            # Try to set and get a test value
            test_key = "healthcheck:test"
            test_value = "ok"
            
            await cache.set(test_key, test_value, ttl=10)
            result = await cache.get(test_key)
            await cache.delete(test_key)
            
            if result == test_value:
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.UP,
                    message="Cache service is working",
                    details={
                        "type": "Redis",
                    }
                )
            else:
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.DEGRADED,
                    message="Cache read/write failed"
                )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DEGRADED,
                message=f"Cache check failed: {str(e)}",
                details={
                    "error": str(e),
                    "impact": "Caching may not be available"
                }
            )


class ExternalAPIChecker(BaseHealthChecker):
    """Health checker for external APIs."""
    
    def __init__(self, name: str, url: str, timeout: int = 5):
        """
        Initialize external API checker.
        
        Args:
            name: Service name
            url: API URL
            timeout: Timeout in seconds
        """
        super().__init__(name)
        self.url = url
        self.timeout = timeout
    
    async def _check(self) -> HealthCheckResult:
        """Check external API health."""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.url, timeout=self.timeout) as response:
                    if response.status == 200:
                        return HealthCheckResult(
                            service=self.name,
                            status=ServiceStatus.UP,
                            message=f"API responded with status {response.status}",
                            details={
                                "url": self.url,
                                "status_code": response.status,
                            }
                        )
                    else:
                        return HealthCheckResult(
                            service=self.name,
                            status=ServiceStatus.DEGRADED,
                            message=f"API returned status {response.status}",
                            details={
                                "url": self.url,
                                "status_code": response.status,
                            }
                        )
        except asyncio.TimeoutError:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DOWN,
                message=f"API timeout after {self.timeout}s",
                details={
                    "url": self.url,
                    "timeout": self.timeout,
                }
            )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.DOWN,
                message=f"API check failed: {str(e)}",
                details={
                    "url": self.url,
                    "error": str(e),
                }
            )


class DiskSpaceChecker(BaseHealthChecker):
    """Health checker for disk space."""
    
    def __init__(self, path: str = ".", threshold_percent: int = 80):
        """
        Initialize disk space checker.
        
        Args:
            path: Path to check
            threshold_percent: Warning threshold percentage
        """
        super().__init__("disk_space")
        self.path = path
        self.threshold_percent = threshold_percent
    
    async def _check(self) -> HealthCheckResult:
        """Check disk space."""
        try:
            import shutil
            
            usage = shutil.disk_usage(self.path)
            used_percent = (usage.used / usage.total) * 100
            
            if used_percent < self.threshold_percent:
                status = ServiceStatus.UP
                message = f"Disk space usage: {used_percent:.1f}%"
            else:
                status = ServiceStatus.DEGRADED
                message = f"Disk space usage is high: {used_percent:.1f}%"
            
            return HealthCheckResult(
                service=self.name,
                status=status,
                message=message,
                details={
                    "path": self.path,
                    "used_percent": round(used_percent, 1),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "total_gb": round(usage.total / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "threshold_percent": self.threshold_percent,
                }
            )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.UNKNOWN,
                message=f"Disk check failed: {str(e)}"
            )


class MemoryChecker(BaseHealthChecker):
    """Health checker for memory usage."""
    
    def __init__(self, threshold_percent: int = 90):
        """
        Initialize memory checker.
        
        Args:
            threshold_percent: Warning threshold percentage
        """
        super().__init__("memory")
        self.threshold_percent = threshold_percent
    
    async def _check(self) -> HealthCheckResult:
        """Check memory usage."""
        try:
            import psutil
            
            memory = psutil.virtual_memory()
            used_percent = memory.percent
            
            if used_percent < self.threshold_percent:
                status = ServiceStatus.UP
                message = f"Memory usage: {used_percent:.1f}%"
            else:
                status = ServiceStatus.DEGRADED
                message = f"Memory usage is high: {used_percent:.1f}%"
            
            return HealthCheckResult(
                service=self.name,
                status=status,
                message=message,
                details={
                    "used_percent": used_percent,
                    "used_gb": round(memory.used / (1024**3), 2),
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "threshold_percent": self.threshold_percent,
                }
            )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.UNKNOWN,
                message=f"Memory check failed: {str(e)}"
            )


class CPUChecker(BaseHealthChecker):
    """Health checker for CPU usage."""
    
    def __init__(self, threshold_percent: int = 80):
        """
        Initialize CPU checker.
        
        Args:
            threshold_percent: Warning threshold percentage
        """
        super().__init__("cpu")
        self.threshold_percent = threshold_percent
    
    async def _check(self) -> HealthCheckResult:
        """Check CPU usage."""
        try:
            import psutil
            
            cpu_percent = psutil.cpu_percent(interval=1)
            
            if cpu_percent < self.threshold_percent:
                status = ServiceStatus.UP
                message = f"CPU usage: {cpu_percent:.1f}%"
            else:
                status = ServiceStatus.DEGRADED
                message = f"CPU usage is high: {cpu_percent:.1f}%"
            
            return HealthCheckResult(
                service=self.name,
                status=status,
                message=message,
                details={
                    "used_percent": cpu_percent,
                    "threshold_percent": self.threshold_percent,
                    "cores": psutil.cpu_count(),
                }
            )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.UNKNOWN,
                message=f"CPU check failed: {str(e)}"
            )


class ApplicationHealthChecker(BaseHealthChecker):
    """Health checker for the application itself."""
    
    def __init__(self):
        super().__init__("application")
    
    async def _check(self) -> HealthCheckResult:
        """Check application health."""
        try:
            # Check if application is running
            import psutil
            
            pid = os.getpid()
            process = psutil.Process(pid)
            
            # Check process status
            if process.is_running():
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.UP,
                    message="Application is running",
                    details={
                        "pid": pid,
                        "ppid": process.ppid(),
                        "name": process.name(),
                        "status": process.status(),
                        "create_time": datetime.fromtimestamp(process.create_time()).isoformat(),
                        "cpu_percent": process.cpu_percent(),
                        "memory_percent": process.memory_percent(),
                    }
                )
            else:
                return HealthCheckResult(
                    service=self.name,
                    status=ServiceStatus.DOWN,
                    message="Application is not running"
                )
        except Exception as e:
            return HealthCheckResult(
                service=self.name,
                status=ServiceStatus.UNKNOWN,
                message=f"Application check failed: {str(e)}"
            )


# ============================================================================
# Health Check Manager
# ============================================================================

class HealthCheckManager:
    """
    Manages health checks for all services.
    """
    
    def __init__(self, include_external: bool = True, include_system: bool = True):
        """
        Initialize the health check manager.
        
        Args:
            include_external: Include external service checks
            include_system: Include system health checks
        """
        self.include_external = include_external
        self.include_system = include_system
        self.checkers: List[BaseHealthChecker] = []
        self._init_checkers()
    
    def _init_checkers(self):
        """Initialize health checkers."""
        # Core services
        self.checkers.append(DatabaseHealthChecker())
        self.checkers.append(RedisHealthChecker())
        self.checkers.append(CacheHealthChecker())
        self.checkers.append(MessageQueueHealthChecker())
        self.checkers.append(ApplicationHealthChecker())
        
        # System checks
        if self.include_system:
            self.checkers.append(DiskSpaceChecker())
            self.checkers.append(MemoryChecker())
            self.checkers.append(CPUChecker())
        
        # External services
        if self.include_external:
            # Add external service checks here
            external_services = [
                ("payment_gateway", settings.PAYMENT_API_URL if hasattr(settings, 'PAYMENT_API_URL') else None),
                ("email_service", settings.EMAIL_API_URL if hasattr(settings, 'EMAIL_API_URL') else None),
                ("sms_service", settings.SMS_API_URL if hasattr(settings, 'SMS_API_URL') else None),
            ]
            for name, url in external_services:
                if url:
                    self.checkers.append(ExternalAPIChecker(name, url))
    
    async def check_all(self) -> OverallHealth:
        """
        Run all health checks.
        
        Returns:
            OverallHealth: Overall health status
        """
        results = []
        
        # Run checks concurrently
        tasks = [checker.check() for checker in self.checkers]
        results = await asyncio.gather(*tasks)
        
        # Determine overall status
        status_counts = {}
        for result in results:
            status_counts[result.status] = status_counts.get(result.status, 0) + 1
        
        # Determine overall health
        if status_counts.get(ServiceStatus.DOWN, 0) > 0:
            overall_status = HealthStatus.UNHEALTHY
        elif status_counts.get(ServiceStatus.DEGRADED, 0) > 0:
            overall_status = HealthStatus.DEGRADED
        elif status_counts.get(ServiceStatus.UNKNOWN, 0) > 0:
            overall_status = HealthStatus.DEGRADED
        else:
            overall_status = HealthStatus.HEALTHY
        
        return OverallHealth(
            status=overall_status,
            services=results
        )
    
    def get_service_status(self, service_name: str) -> Optional[ServiceStatus]:
        """
        Get status of a specific service.
        
        Args:
            service_name: Name of the service
            
        Returns:
            Optional[ServiceStatus]: Service status or None
        """
        for checker in self.checkers:
            if checker.name == service_name:
                result = asyncio.run(checker.check())
                return result.status
        return None


# ============================================================================
# Output Formatters
# ============================================================================

class OutputFormatter:
    """Base class for output formatters."""
    
    def format(self, health: OverallHealth) -> str:
        """
        Format the health check results.
        
        Args:
            health: Overall health object
            
        Returns:
            str: Formatted output
        """
        raise NotImplementedError("Subclasses must implement format")


class JSONFormatter(OutputFormatter):
    """JSON output formatter."""
    
    def format(self, health: OverallHealth) -> str:
        """Format as JSON."""
        return json.dumps(health.to_dict(), indent=2)


class ConsoleFormatter(OutputFormatter):
    """Console output formatter."""
    
    def format(self, health: OverallHealth) -> str:
        """Format for console output."""
        lines = []
        lines.append("=" * 60)
        lines.append("HEALTH CHECK REPORT")
        lines.append("=" * 60)
        lines.append(f"Status: {health.status.value.upper()}")
        lines.append(f"Timestamp: {health.timestamp}")
        lines.append(f"Version: {health.version}")
        lines.append("=" * 60)
        lines.append("")
        
        lines.append("SERVICE STATUS:")
        lines.append("-" * 60)
        
        for service in health.services:
            status_color = self._get_status_color(service.status)
            status_icon = self._get_status_icon(service.status)
            lines.append(
                f"{status_icon} {service.service}: {service.status.value.upper()}"
                f" [{service.response_time:.0f}ms]"
            )
            if service.message:
                lines.append(f"   └── {service.message}")
            if service.details:
                for key, value in service.details.items():
                    lines.append(f"       {key}: {value}")
            lines.append("")
        
        lines.append("-" * 60)
        
        # Summary
        summary = health._get_summary()
        lines.append("SUMMARY:")
        lines.append(f"  Services up: {summary.get('up', 0)}")
        lines.append(f"  Services degraded: {summary.get('degraded', 0)}")
        lines.append(f"  Services down: {summary.get('down', 0)}")
        lines.append(f"  Services unknown: {summary.get('unknown', 0)}")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)
    
    def _get_status_icon(self, status: ServiceStatus) -> str:
        """Get status icon."""
        icons = {
            ServiceStatus.UP: "✅",
            ServiceStatus.DEGRADED: "⚠️",
            ServiceStatus.DOWN: "❌",
            ServiceStatus.UNKNOWN: "❓",
        }
        return icons.get(status, "❓")
    
    def _get_status_color(self, status: ServiceStatus) -> str:
        """Get status color."""
        colors = {
            ServiceStatus.UP: "\033[92m",  # Green
            ServiceStatus.DEGRADED: "\033[93m",  # Yellow
            ServiceStatus.DOWN: "\033[91m",  # Red
            ServiceStatus.UNKNOWN: "\033[94m",  # Blue
        }
        return colors.get(status, "")


class PrometheusFormatter(OutputFormatter):
    """Prometheus metrics output formatter."""
    
    def format(self, health: OverallHealth) -> str:
        """Format for Prometheus."""
        lines = []
        
        # Global status
        lines.append(f'# HELP health_status Overall health status (0=healthy, 1=degraded, 2=unhealthy)')
        lines.append(f'# TYPE health_status gauge')
        status_value = 0 if health.status == HealthStatus.HEALTHY else 1 if health.status == HealthStatus.DEGRADED else 2
        lines.append(f'health_status {status_value}')
        
        lines.append('')
        
        # Service statuses
        lines.append(f'# HELP service_status Service health status (0=up, 1=degraded, 2=down, 3=unknown)')
        lines.append(f'# TYPE service_status gauge')
        
        for service in health.services:
            status_value = 0 if service.status == ServiceStatus.UP else 1 if service.status == ServiceStatus.DEGRADED else 2 if service.status == ServiceStatus.DOWN else 3
            lines.append(f'service_status{{service="{service.service}"}} {status_value}')
        
        lines.append('')
        
        # Response times
        lines.append(f'# HELP service_response_time Service response time in milliseconds')
        lines.append(f'# TYPE service_response_time gauge')
        
        for service in health.services:
            lines.append(f'service_response_time{{service="{service.service}"}} {service.response_time:.2f}')
        
        return "\n".join(lines)


# ============================================================================
# Main Execution
# ============================================================================

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Health check for parking management system"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["json", "console", "prometheus"],
        default="console",
        help="Output format"
    )
    parser.add_argument(
        "--include-external",
        action="store_true",
        default=False,
        help="Include external service checks"
    )
    parser.add_argument(
        "--include-system",
        action="store_true",
        default=False,
        help="Include system health checks (CPU, memory, disk)"
    )
    parser.add_argument(
        "--service",
        type=str,
        default=None,
        help="Check specific service only"
    )
    parser.add_argument(
        "--exit-code",
        action="store_true",
        default=False,
        help="Return exit code based on health status (0=healthy, 1=degraded, 2=unhealthy)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Timeout in seconds"
    )
    return parser.parse_args()


async def main():
    """Main entry point."""
    args = parse_args()
    
    # Log startup
    logger.info("Running health checks...")
    
    try:
        # Create health check manager
        manager = HealthCheckManager(
            include_external=args.include_external,
            include_system=args.include_system
        )
        
        # Run checks
        health = await manager.check_all()
        
        # Select formatter
        formatters = {
            "json": JSONFormatter(),
            "console": ConsoleFormatter(),
            "prometheus": PrometheusFormatter(),
        }
        formatter = formatters.get(args.format, ConsoleFormatter())
        
        # Print output
        output = formatter.format(health)
        print(output)
        
        # Return exit code if requested
        if args.exit_code:
            if health.status == HealthStatus.HEALTHY:
                sys.exit(0)
            elif health.status == HealthStatus.DEGRADED:
                sys.exit(1)
            else:
                sys.exit(2)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nHealth check interrupted")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)