# server/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer 
from jose import JWTError, jwt 
from pydantic import ValidationError 

from server.core.config import settings
from server.crud import user as crud_user 


reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(reusable_oauth2)) -> dict:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("id")
        user_role: str = payload.get("role")
        user_email: str = payload.get("sub") 
        if user_id is None or user_role is None or user_email is None:
            raise credentials_exception
        
        user_in_db = await crud_user.get_user_by_id(user_id)
        if user_in_db is None:
            raise credentials_exception

        return {
            "id": str(user_in_db.id),
            "email": user_in_db.email,
            "name": user_in_db.name,
            "role": user_in_db.role
        }
    except (JWTError, ValidationError):
        raise credentials_exception


