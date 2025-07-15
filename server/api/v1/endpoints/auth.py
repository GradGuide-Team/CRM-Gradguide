# server/api/v1/endpoints/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from mongoengine.errors import NotUniqueError, DoesNotExist, ValidationError # Import specific MongoEngine errors

from server.schemas.user import UserCreate, UserPublic, Token
from server.crud import user as crud_user
from server.core.security import verify_password, create_access_token
from datetime import timedelta
from server.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup_user(user_in: UserCreate):
    try:
        # Check if user with this email already exists
        existing_user = await crud_user.get_user_by_mail(email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create the user in the database
        user = await crud_user.create_user(user_in)
        return user
    except NotUniqueError: # Specific MongoEngine error for unique constraint violation
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # Conflict status code is more appropriate for unique constraint
            detail="User with this email already exists."
        )
    except ValidationError as e: # Catch MongoEngine validation errors (e.g., if a field doesn't match model)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {e}"
        )
    except Exception as e: # Catch any other unexpected errors
        print(f"An unexpected error occurred during signup: {e}") # Log the actual error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during user registration."
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await crud_user.get_user_by_mail(email=form_data.username)

        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "id": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user":user.to_public_dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during login."
        )
