from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import random

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

class SuggestionRequest(BaseModel):
    product_title: str
    category: str
    brand: str

class SuggestedProduct(BaseModel):
    id: str
    title: str
    price: float
    image: str
    reason: str

class SuggestionResponse(BaseModel):
    success: bool
    suggestions: List[SuggestedProduct]

# Mock database of items to suggest
MOCK_INVENTORY = [
    {"id": "101", "title": "Slim Fit Denim Jeans", "category": "Pants", "price": 1999.0, "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"},
    {"id": "102", "title": "White Canvas Sneakers", "category": "Shoes", "price": 1499.0, "image": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400"},
    {"id": "103", "title": "Leather Crossbody Bag", "category": "Accessories", "price": 2499.0, "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"},
    {"id": "104", "title": "Classic Aviator Sunglasses", "category": "Accessories", "price": 899.0, "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400"},
    {"id": "105", "title": "Cotton Chino Shorts", "category": "Shorts", "price": 1299.0, "image": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400"},
]

@router.post("/related", response_model=SuggestionResponse)
async def get_suggestions(req: SuggestionRequest):
    """
    Lightweight TF-IDF or rule-based Content-Based Filtering.
    For this demo, we use heuristic matching based on category.
    """
    cat_lower = req.category.lower()
    title_lower = req.product_title.lower()
    
    suggestions = []
    
    # Simple heuristic rules to suggest complementary items
    if "shirt" in title_lower or "top" in title_lower:
        # Suggest pants and shoes
        matches = [i for i in MOCK_INVENTORY if i["category"] in ["Pants", "Shorts", "Shoes"]]
        selected = random.sample(matches, min(3, len(matches)))
        for s in selected:
            s_copy = dict(s)
            s_copy["reason"] = "Completes the look"
            suggestions.append(s_copy)
            
    elif "dress" in title_lower:
        # Suggest accessories and shoes
        matches = [i for i in MOCK_INVENTORY if i["category"] in ["Accessories", "Shoes"]]
        selected = random.sample(matches, min(3, len(matches)))
        for s in selected:
            s_copy = dict(s)
            s_copy["reason"] = "Pairs perfectly"
            suggestions.append(s_copy)
            
    else:
        # Generic suggestions
        selected = random.sample(MOCK_INVENTORY, 3)
        for s in selected:
            s_copy = dict(s)
            s_copy["reason"] = "Popular choice"
            suggestions.append(s_copy)
            
    return SuggestionResponse(
        success=True,
        suggestions=[SuggestedProduct(**s) for s in suggestions]
    )
