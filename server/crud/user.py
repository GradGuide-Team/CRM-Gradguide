# server/crud/user.py - Updated for unified structure
from typing import Optional
from mongoengine.errors import DoesNotExist, NotUniqueError
from server.db.models import User
from server.schemas.user import UserCreate
from server.core.security import get_password_hash

async def get_user_by_mail(email: str) -> Optional[User]:
    """Get user by email"""
    try:
        return User.objects(email=email).first()
    except DoesNotExist:
        return None

async def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID"""
    try:
        return User.objects(id=user_id).first()
    except DoesNotExist:
        return None
    except Exception:
        return None

async def create_user(user_in: UserCreate) -> User:
    """Create a new user"""
    try:
        # Hash the password and use 'password' field (not 'hashed_password')
        hashed_password = get_password_hash(user_in.password)
        
        # Map 'member' to 'counselor' if needed
        user_role = user_in.role
        if user_role == "member":
            user_role = "counselor"
        
        user = User(
            email=user_in.email,
            password=hashed_password,  # Changed from 'hashed_password' to 'password'
            name=user_in.name,
            role=user_role
        )
        user.save()
        return user
    except NotUniqueError:
        raise ValueError("User with this email already exists")

async def update_user(user_id: str, update_data: dict) -> Optional[User]:
    """Update user data"""
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return None
        
        # Hash password if it's being updated
        if 'password' in update_data:
            update_data['password'] = get_password_hash(update_data['password'])
        
        # Update fields
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        user.save()
        return user
    except DoesNotExist:
        return None

async def delete_user(user_id: str) -> bool:
    """Delete a user"""
    try:
        user = User.objects(id=user_id).first()
        if user:
            user.delete()
            return True
        return False
    except DoesNotExist:
        return False

async def get_all_users() -> list[User]:
    """Get all users (admin only)"""
    return list(User.objects.all())