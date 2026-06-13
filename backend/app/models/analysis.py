from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TopicSentiment(BaseModel):
    topic: str
    sentiment: float
    mention_count: int


class SentimentSummary(BaseModel):
    positive_pct: float = 0
    neutral_pct: float = 0
    negative_pct: float = 0
    average_compound: float = 0


class BuyConfidence(BaseModel):
    score: float = 0
    grade: str = "C"
    recommendation: str = ""
    breakdown: dict = {}


class SizeRecommendation(BaseModel):
    recommended_size: str = ""
    confidence: int = 0
    alternative_size: str = ""
    bmi: float = 0
    size_chart: List[dict] = []


class AnalysisResponse(BaseModel):
    product_id: str
    sentiment_summary: SentimentSummary = SentimentSummary()
    summary_text: str = ""
    pros: List[str] = []
    cons: List[str] = []
    topics: List[TopicSentiment] = []
    buy_confidence: BuyConfidence = BuyConfidence()
    reviews: List[dict] = []
    created_at: Optional[datetime] = None


class SizePredictRequest(BaseModel):
    height_cm: float
    weight_kg: float
    body_type: str = "regular"  # slim, regular, athletic, plus
    brand: Optional[str] = None


class CompareRequest(BaseModel):
    product_ids: List[str]
