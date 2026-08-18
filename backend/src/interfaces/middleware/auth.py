# ============================================================================
# Authentication Middleware
# ============================================================================

"""
Authentication middleware for FastAPI.
"""

from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError, jwt

from src.core.config import settings
from src.infrastructure.repositories import UserRepository
from src.infrastructure.cache import CacheClient


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware for FastAPI.
    """
    
    def __init__(self, app, user_repository: UserRepository, cache_client: Optional[CacheClient] = None):
        super().__init__(app)
        self.user_repository = user_repository
        self.cache_client = cache_client
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for public routes
        if self._is_public_route(request.url.path):
            return await call_next(request)
        
        # Get token from Authorization header
        token = self._get_token(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Validate token
        user = await self._validate_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Attach user to request
        request.state.user = user
        
        return await call_next(request)
    
    def _is_public_route(self, path: str) -> bool:
        """Check if route is public."""
        public_paths = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/webhooks/",
        ]
        
        for public_path in public_paths:
            if path.startswith(public_path):
                return True
        
        return False
    
    def _get_token(self, request: Request) -> Optional[str]:
        """Get token from Authorization header."""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        return auth_header[7:]
    
    async def _validate_token(self, token: str) -> Optional[dict]:
        """Validate JWT token."""
        try:
            # Decode token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
            
            # Get user ID from payload
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            # Check cache first
            if self.cache_client:
                cache_key = f"user:{user_id}"
                cached_user = await self.cache_client.get(cache_key)
                if cached_user:
                    return cached_user
            
            # Get user from repository
            user = await self.user_repository.get_by_id(user_id)
            if not user or not user.is_active:
                return None
            
            # Cache user
            if self.cache_client:
                await self.cache_client.set(
                    f"user:{user_id}",
                    user.to_dict(),
                    ttl=300,  # 5 minutes
                )
            
            return user.to_dict()
            
        except JWTError:
            return None


class JWTAuth(HTTPBearer):
    """
    JWT Authentication dependency.
    """
    
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
    
    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        credentials = await super().__call__(request)
        
        if not credentials:
            return None
        
        # Validate token
        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )