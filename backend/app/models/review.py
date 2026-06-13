from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    text: str
    rating: Optional[float] = None
    author: Optional[str] = "Anonymous"
    date: Optional[datetime] = None


class ReviewWithSentiment(ReviewBase):
    sentiment: dict = {}  # {"compound": 0.82, "label": "positive"}
