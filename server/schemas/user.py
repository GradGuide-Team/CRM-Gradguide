# server/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal, Any
from bson import ObjectId
from pydantic_core import core_schema
# Pydantic's ObjectId handling (for converting MongoDB's _id to string)
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda instance: str(instance)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema, handler):
        # Return a simple string schema for JSON
        return {"type": "string"}

# --- User Creation (for Signup) ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["admin", "counselor"] = "counselor"
    

# --- User Login ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- User Public Data (for Responses, excludes password_hash) ---
class UserPublic(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,  # Allow population from ORM objects
        populate_by_name=True,  # Allow mapping _id to id
        arbitrary_types_allowed=True,  # Allow ObjectId type
    )
    
    id: PyObjectId = Field(alias="_id")  # Map MongoDB's _id to 'id' for JSON
    name: str
    email: EmailStr
    role: Literal["admin", "counselor"]
# --- JWT Token Response ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
