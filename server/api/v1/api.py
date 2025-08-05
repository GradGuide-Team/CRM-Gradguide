# server/api/v1/api.py
from fastapi import APIRouter
from server.api.v1.endpoints import auth 
from server.api.v1.endpoints import students , mails

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, tags=["Students"])
api_router.include_router(mails.router, prefix="/mail", tags=["Mails"])