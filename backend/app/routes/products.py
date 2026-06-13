from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.product import AnalyzeUrlRequest, AnalyzeUrlResponse, ProductResponse
from app.models.analysis import AnalysisResponse, SizePredictRequest, SizeRecommendation
from app.services.extractor import extract_product
from app.services.screenshot_ocr import extract_from_screenshot
from app.services.review_analyzer import ReviewAnalyzer
from app.services.confidence_scorer import calculate_buy_confidence
from app.services.size_predictor import predict_size
from app.database import products_collection, analyses_collection
from app.utils.auth_utils import get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/products", tags=["products"])
analyzer = ReviewAnalyzer()

@router.post("/analyze-url", response_model=AnalyzeUrlResponse)
async def analyze_url(req: AnalyzeUrlRequest):
    # 1. Extract product & reviews
    ext_result = extract_product(req.url)
    
    if ext_result["screenshot_required"]:
        return AnalyzeUrlResponse(
            success=False,
            screenshot_required=True,
            message=ext_result.get("message", "Scraping failed, screenshot required")
        )

    product_data = ext_result["product"]
    reviews = ext_result["reviews"]

    # 2. Run Analysis
    analysis_data = analyzer.full_analysis(reviews)
    confidence = calculate_buy_confidence(
        analysis_data["sentiment_summary"], 
        product_data.get("review_count", 0), 
        product_data.get("rating", 0)
    )

    # 3. Save to DB (mock IDs for simplicity in this demo without full ObjectId handling everywhere)
    prod_id = str(uuid.uuid4())
    product_res = ProductResponse(id=prod_id, **product_data)
    
    analysis_res = AnalysisResponse(
        product_id=prod_id,
        sentiment_summary=analysis_data["sentiment_summary"],
        summary_text=analysis_data["summary_text"],
        pros=analysis_data["pros"],
        cons=analysis_data["cons"],
        topics=analysis_data["topics"],
        buy_confidence=confidence,
        reviews=analysis_data["analyzed_reviews"],
        created_at=datetime.now(timezone.utc)
    )

    # In a real app, save to products_collection and analyses_collection here

    return AnalyzeUrlResponse(
        success=True,
        product=product_res,
        analysis=analysis_res.model_dump(),
        message="Analysis complete"
    )

@router.post("/analyze-screenshot", response_model=AnalyzeUrlResponse)
async def analyze_screenshot(file: UploadFile = File(...)):
    contents = await file.read()
    ocr_result = extract_from_screenshot(contents)

    if not ocr_result["success"]:
        return AnalyzeUrlResponse(
            success=False,
            message=ocr_result["message"]
        )

    product_data = ocr_result["product"]
    product_data["extracted_via"] = "screenshot_ocr"
    product_data["url"] = "Screenshot Upload"
    
    # Generate some mock reviews to show analysis works
    from app.services.extractor import _get_mock_reviews
    reviews = _get_mock_reviews(product_data.get("title", "mock"))

    # Run Analysis
    analysis_data = analyzer.full_analysis(reviews)
    confidence = calculate_buy_confidence(
        analysis_data["sentiment_summary"], 
        150, # mock volume
        product_data.get("rating", 0)
    )

    prod_id = str(uuid.uuid4())
    product_res = ProductResponse(id=prod_id, **product_data)
    
    analysis_res = AnalysisResponse(
        product_id=prod_id,
        sentiment_summary=analysis_data["sentiment_summary"],
        summary_text=analysis_data["summary_text"],
        pros=analysis_data["pros"],
        cons=analysis_data["cons"],
        topics=analysis_data["topics"],
        buy_confidence=confidence,
        reviews=analysis_data["analyzed_reviews"],
        created_at=datetime.now(timezone.utc)
    )

    return AnalyzeUrlResponse(
        success=True,
        product=product_res,
        analysis=analysis_res.model_dump(),
        message=ocr_result["message"]
    )

@router.post("/size-predict", response_model=SizeRecommendation)
async def get_size_prediction(req: SizePredictRequest):
    result = predict_size(req.height_cm, req.weight_kg, req.body_type, req.brand)
    return SizeRecommendation(**result)
