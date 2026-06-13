from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.database import users_collection
from app.utils.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_dict.pop("password"))
    
    result = await users_collection.insert_one(user_dict)
    
    user_res = UserResponse(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email
    )
    
    token = create_access_token(user_res.id, user_res.email)
    return TokenResponse(access_token=token, user=user_res)

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_res = UserResponse(
        id=str(db_user["_id"]),
        name=db_user["name"],
        email=db_user["email"],
        preferences=db_user.get("preferences", {})
    )
    
    token = create_access_token(user_res.id, user_res.email)
    return TokenResponse(access_token=token, user=user_res)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)
