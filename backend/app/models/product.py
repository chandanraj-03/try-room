from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    url: Optional[str] = None
    platform: Optional[str] = None
    title: str = ""
    brand: str = ""
    price: float = 0.0
    currency: str = "INR"
    rating: float = 0.0
    review_count: int = 0
    images: List[str] = []
    description: str = ""
    category: str = ""
    extracted_via: str = "scraping"  # "scraping" or "screenshot_ocr"


class ProductResponse(ProductBase):
    id: str
    created_at: Optional[datetime] = None


class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., min_length=10)


class AnalyzeUrlResponse(BaseModel):
    success: bool
    product: Optional[ProductResponse] = None
    analysis: Optional[dict] = None
    screenshot_required: bool = False
    message: str = ""
