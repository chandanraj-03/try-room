import math

def calculate_buy_confidence(sentiment_data: dict, review_count: int, avg_rating: float) -> dict:
    """
    Calculates a 'Buy Confidence Score' out of 10 based on sentiment, rating, and volume.
    """
    # 1. Normalize sentiment (-1 to 1) to (0 to 10)
    avg_compound = sentiment_data.get("average_compound", 0)
    sentiment_score = (avg_compound + 1) * 5

    # 2. Rating score (0 to 5) to (0 to 10)
    rating_score = min(max(avg_rating * 2, 0), 10)

    # 3. Volume score (logarithmic, caps around 1000 reviews = 10)
    # log10(100) = 2, log10(1000) = 3
    if review_count > 0:
        volume_score = min((math.log10(review_count) / 3) * 10, 10)
    else:
        volume_score = 0

    # 4. Consistency score (ratio of positive to negative)
    pos_pct = sentiment_data.get("positive_pct", 0)
    neg_pct = sentiment_data.get("negative_pct", 0)
    total_polarized = pos_pct + neg_pct
    if total_polarized > 0:
        consistency_score = (pos_pct / total_polarized) * 10
    else:
        consistency_score = 5

    # Weighted combination
    weights = {
        "sentiment": 0.35,
        "rating": 0.25,
        "consistency": 0.25,
        "volume": 0.15
    }

    final_score = (
        (sentiment_score * weights["sentiment"]) +
        (rating_score * weights["rating"]) +
        (consistency_score * weights["consistency"]) +
        (volume_score * weights["volume"])
    )

    final_score = round(min(max(final_score, 0.0), 10.0), 1)

    # Assign Grade and Recommendation
    if final_score >= 8.5:
        grade = "A"
        rec = "Highly Recommended"
    elif final_score >= 7.0:
        grade = "B"
        rec = "Recommended"
    elif final_score >= 5.5:
        grade = "C"
        rec = "Neutral"
    elif final_score >= 4.0:
        grade = "D"
        rec = "Proceed with Caution"
    else:
        grade = "F"
        rec = "Not Recommended"

    return {
        "score": final_score,
        "grade": grade,
        "recommendation": rec,
        "breakdown": {
            "sentiment": round(sentiment_score, 1),
            "rating": round(rating_score, 1),
            "consistency": round(consistency_score, 1),
            "volume": round(volume_score, 1)
        }
    }
