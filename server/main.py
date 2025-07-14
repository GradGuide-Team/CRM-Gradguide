# server/main.py
from contextlib import asynccontextmanager # Import for lifespan
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # For handling CORS from your frontend

from server.api.v1.api import api_router
from server.db.connection import connect_to_mongo, close_mongo_connection
from server.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to MongoDB...")
    await connect_to_mongo() # Connect when the app starts
    yield
    print("Closing MongoDB connection...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="GradGuide CRM Backend API",
    lifespan=lifespan
)
origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def read_root():
    """Basic root endpoint to confirm API is running."""
    return {"message": "Welcome to GradGuide CRM API! Visit /docs for API documentation."}