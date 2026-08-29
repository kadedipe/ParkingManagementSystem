from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from src.auth.models import UserCreate, Token, UserLogin
from src.auth.service import AuthService
from src.auth.dependencies import get_current_user
from src.core.database import get_db
from src.repositories.user_repository import UserRepository
from src.domain.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    repo = UserRepository(db)
    
    # Check if username exists
    existing_user = await repo.get_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = await repo.get_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = uuid4()
    new_user = User(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        hashed_password=AuthService.get_password_hash(user_data.password),
        is_active=True,
        is_admin=False
    )
    
    await repo.create(new_user)
    
    # Create access token
    access_token = AuthService.create_access_token(
        data={
            "sub": user_data.username,
            "user_id": str(user_id),
            "is_admin": False
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user"""
    repo = UserRepository(db)
    
    user = await repo.get_by_username(login_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not AuthService.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    access_token = AuthService.create_access_token(
        data={
            "sub": user.username,
            "user_id": str(user.id),
            "is_admin": user.is_admin
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    """Protected route example"""
    return {
        "message": "You have access to this protected route!",
        "user": current_user.username
    }
