from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

# Collections
users_collection = db["users"]
products_collection = db["products"]
reviews_collection = db["reviews"]
analyses_collection = db["analyses"]


async def init_db():
    """Create indexes on startup."""
    await users_collection.create_index("email", unique=True)
    await products_collection.create_index("url")
    await reviews_collection.create_index("product_id")
    await analyses_collection.create_index([("product_id", 1), ("user_id", 1)])
