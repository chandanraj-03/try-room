from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes import auth, products, comparison, chat, suggestions

app = FastAPI(title="FashionAI Try-On & Review Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(comparison.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(suggestions.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
