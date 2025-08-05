# server/api/v1/endpoints/auth.py - Updated for unified structure
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from mongoengine.errors import NotUniqueError, DoesNotExist, ValidationError
from datetime import timedelta

from server.core.auth import get_current_user
from server.schemas.user import UserCreate, UserPublic, Token
from server.crud import user as crud_user
from server.core.security import verify_password, create_access_token
from server.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup_user(user_in: UserCreate):
    """Unified signup endpoint for both FastAPI and Node.js"""
    try:
        # Check if user with this email already exists
        existing_user = await crud_user.get_user_by_mail(email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create the user in the database (uses 'users' collection)
        user = await crud_user.create_user(user_in)
        return user.to_public_dict()
        
    except ValueError as ve:
        # Handle our custom ValueError from create_user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except NotUniqueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists."
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {e}"
        )
    except Exception as e:
        print(f"An unexpected error occurred during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during user registration."
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Unified login endpoint"""
    try:
        user = await crud_user.get_user_by_mail(email=form_data.username)

        # FIXED: Use 'password' field instead of 'hashed_password'
        if not user or not verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Handle role mapping
        token_role = user.role
        if user.role == "member":
            token_role = "counselor"
            
        # Create token payload to match Node.js structure
        token_data = {
            "userId": str(user.id),
            "email": user.email,
            "role": token_role
        }
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user": user.to_public_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during login."
        )

@router.get("/me", response_model=UserPublic)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        user = await crud_user.get_user_by_id(current_user["userId"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user.to_public_dict()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )