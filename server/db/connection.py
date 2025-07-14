# Sets up and manages the connection to your MongoDB database using MongoEngine.
from mongoengine import connect, disconnect
from server.core.config import settings

async def connect_to_mongo():
    """Establishes connection to MongoDB."""
    connect(db='crm_db', host=settings.DATABASE_URL) # settings.DATABASE_URL would be like 'mongodb://localhost:27017/'
    print("MongoDB connected!")

async def close_mongo_connection():
    """Closes the MongoDB connection."""
    disconnect()
    print("MongoDB disconnected.")