from fastapi import APIRouter, Depends
from app.models.analysis import CompareRequest
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/comparison", tags=["comparison"])

@router.post("/compare")
async def compare_products(req: CompareRequest):
    # In a real app, fetch products from DB by IDs
    # For this demo, we'll return a mocked comparison structure
    return {
        "success": True,
        "message": "Comparison generated (Mock)",
        "product_ids": req.product_ids,
        "dimensions": [
            {"name": "Price", "best_index": 0},
            {"name": "Rating", "best_index": 1},
            {"name": "Buy Score", "best_index": 0}
        ]
    }
