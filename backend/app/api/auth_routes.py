from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import UserLogin, UserRegister, Token, UserResponse, UserCreate
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_all_users,
    deactivate_user,
    activate_user,
    get_user_by_email
)
from app.dependencies import get_current_user, get_current_superuser
from app.db.models import User
import secrets

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active
        }
    }

@router.post("/register")
def register_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Register a new user (superuser only). Returns user info and generated password."""
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate a random password
    password = secrets.token_urlsafe(16)
    
    # Create user (regular user, not superuser)
    user = create_user(db, user_data.email, password, is_superuser=False)
    
    return {
        "id": user.id,
        "email": user.email,
        "is_superuser": user.is_superuser,
        "is_active": user.is_active,
        "password": password  # Return password so superuser can share it
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active
    }

@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(get_current_superuser)])
def list_users(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """List all users (superuser only)."""
    users = get_all_users(db)
    return [
        {
            "id": user.id,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active
        }
        for user in users
    ]

@router.post("/users/{user_id}/deactivate", dependencies=[Depends(get_current_superuser)])
def deactivate_user_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Deactivate a user (superuser only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    success = deactivate_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deactivated successfully"}

@router.post("/users/{user_id}/activate", dependencies=[Depends(get_current_superuser)])
def activate_user_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Activate a user (superuser only)."""
    success = activate_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User activated successfully"}

