# ============================================================================
# Authentication API Routes
# ============================================================================

"""
Authentication API routes for version 1.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from src.interfaces.schemas import (
    UserRegister,
    UserRegisterResponse,
    UserLogin,
    UserLoginResponse,
    UserResponse,
    ChangePasswordRequest,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    BaseResponse,
)
from src.interfaces.dependencies import get_auth_service, get_current_user
from src.application.services.auth_service import AuthService
from src.domain.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRegisterResponse)
async def register(
    data: UserRegister,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Register a new user.
    
    Args:
        data: User registration data
        auth_service: Authentication service
        
    Returns:
        UserRegisterResponse: Registered user details
    """
    try:
        user, token = await auth_service.register(data)
        return UserRegisterResponse(
            user=UserResponse.from_entity(user),
            access_token=token.access_token,
            refresh_token=token.refresh_token,
            token_type="bearer",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", response_model=UserLoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Login user.
    
    Args:
        form_data: Login credentials
        auth_service: Authentication service
        
    Returns:
        UserLoginResponse: Login response with tokens
    """
    try:
        user, token = await auth_service.login(form_data.username, form_data.password)
        return UserLoginResponse(
            user=UserResponse.from_entity(user),
            access_token=token.access_token,
            refresh_token=token.refresh_token,
            token_type="bearer",
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/refresh", response_model=UserLoginResponse)
async def refresh_token(
    refresh_token: str,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Refresh access token.
    
    Args:
        refresh_token: Refresh token
        auth_service: Authentication service
        
    Returns:
        UserLoginResponse: New token response
    """
    try:
        user, token = await auth_service.refresh_token(refresh_token)
        return UserLoginResponse(
            user=UserResponse.from_entity(user),
            access_token=token.access_token,
            refresh_token=token.refresh_token,
            token_type="bearer",
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token refresh failed")


@router.post("/logout", response_model=BaseResponse)
async def logout(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Logout user.
    
    Args:
        current_user: Current authenticated user
        auth_service: Authentication service
        
    Returns:
        BaseResponse: Success response
    """
    try:
        await auth_service.logout(current_user.id)
        return BaseResponse(success=True, message="Logged out successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: User details
    """
    return UserResponse.from_entity(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Update current user.
    
    Args:
        data: Update data
        current_user: Current authenticated user
        auth_service: Authentication service
        
    Returns:
        UserResponse: Updated user details
    """
    try:
        user = await auth_service.update_user(current_user.id, data)
        return UserResponse.from_entity(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="User update failed")


@router.post("/change-password", response_model=BaseResponse)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Change user password.
    
    Args:
        data: Password change data
        current_user: Current authenticated user
        auth_service: Authentication service
        
    Returns:
        BaseResponse: Success response
    """
    try:
        await auth_service.change_password(
            current_user.id,
            data.current_password,
            data.new_password,
        )
        return BaseResponse(success=True, message="Password changed successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password change failed")


@router.post("/forgot-password", response_model=BaseResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Request password reset.
    
    Args:
        data: Forgot password request
        auth_service: Authentication service
        
    Returns:
        BaseResponse: Success response
    """
    try:
        await auth_service.forgot_password(data.email)
        return BaseResponse(
            success=True,
            message="Password reset instructions sent to your email",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password reset request failed")


@router.post("/reset-password", response_model=BaseResponse)
async def reset_password(
    data: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Reset password with token.
    
    Args:
        data: Reset password data
        auth_service: Authentication service
        
    Returns:
        BaseResponse: Success response
    """
    try:
        await auth_service.reset_password(data.token, data.new_password)
        return BaseResponse(success=True, message="Password reset successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password reset failed")