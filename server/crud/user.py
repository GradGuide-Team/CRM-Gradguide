from server.schemas.user import UserCreate, UserPublic
from server.db.models import User
from server.core.security import get_password_hash
from bson import ObjectId 

async def create_user(user_data:UserCreate)-> UserPublic:
    hashed_password = get_password_hash(user_data.password)

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    user.save()
    user_dict = {
        "_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }
    
    return UserPublic.model_validate(user_dict)


async def get_user_by_mail(email:str)-> User:
    user = User.objects(email=email).first()
    return user

async def get_user_by_id(user_id: str) -> User | None:
    """
    Retrieves a user document by ID.
    Returns the raw MongoEngine User object.
    """
    if not ObjectId.is_valid(user_id):
        return None 
    user = User.objects(id=user_id).first()
    return user