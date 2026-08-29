from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID, uuid4

from src.auth.models import UserCreate, Token, UserLogin, TokenData
from src.auth.service import AuthService
from src.auth.dependencies import get_current_user
from src.core.database import get_db
from src.repositories.user_repository import UserRepository
from src.domain.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class ProfileUpdate(BaseModel):
    firstName: Optional[str] = Field(default=None, max_length=50)
    lastName: Optional[str] = Field(default=None, max_length=50)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=255)
    bio: Optional[str] = Field(default=None, max_length=2000)
    avatar: Optional[str] = None


def _user_payload(user: User) -> dict:
    names = (user.full_name or "").strip().split(" ", 1)
    first_name = names[0] if names else ""
    last_name = names[1] if len(names) > 1 else ""
    return {
        "id": str(user.id),
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "firstName": first_name,
        "lastName": last_name,
        "fullName": user.full_name,
        "phone": user.phone_number or "",
        "address": user.address or "",
        "bio": user.bio or "",
        "avatar": user.avatar or "",
        "role": "admin" if user.is_admin else "User",
        "status": "Active" if user.is_active else "Inactive",
        "isAdmin": user.is_admin,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
    }


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    existing_user = await repo.get_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    existing_email = await repo.get_by_email(user_data.email)
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_id = uuid4()
    new_user = User(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        hashed_password=AuthService.get_password_hash(user_data.password),
        is_active=True,
        is_admin=False,
    )
    await repo.create(new_user)
    access_token = AuthService.create_access_token(
        data={"sub": user_data.username, "user_id": str(user_id), "is_admin": False}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_username(login_data.username)
    if not user or not AuthService.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is disabled")

    access_token = AuthService.create_access_token(
        data={"sub": user.username, "user_id": str(user.id), "is_admin": user.is_admin}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(current_user.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_payload(user)


@router.get("/profile")
async def get_profile(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(current_user.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_payload(user)


@router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(current_user.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = profile.model_dump(exclude_unset=True)
    if "firstName" in updates or "lastName" in updates:
        current_names = (user.full_name or "").strip().split(" ", 1)
        current_first = current_names[0] if current_names else ""
        current_last = current_names[1] if len(current_names) > 1 else ""
        first = (updates.get("firstName", current_first) or "").strip()
        last = (updates.get("lastName", current_last) or "").strip()
        full_name = f"{first} {last}".strip()
        if not full_name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        user.full_name = full_name

    if "phone" in updates:
        user.phone_number = (updates["phone"] or "").strip() or None
    if "address" in updates:
        user.address = (updates["address"] or "").strip() or None
    if "bio" in updates:
        user.bio = (updates["bio"] or "").strip() or None
    if "avatar" in updates:
        avatar = updates["avatar"] or ""
        if avatar and not avatar.startswith("data:image/"):
            raise HTTPException(status_code=400, detail="Avatar must be an image data URL")
        if len(avatar) > 2_000_000:
            raise HTTPException(status_code=413, detail="Avatar image is too large")
        user.avatar = avatar or None

    await db.commit()
    await db.refresh(user)
    return _user_payload(user)


@router.get("/protected")
async def protected_route(current_user=Depends(get_current_user)):
    return {"message": "You have access to this protected route!", "user": current_user.username}
