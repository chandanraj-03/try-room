SIZE_CHARTS = {
    "default": {
        # (min_bmi, max_bmi): size
        (0, 17.5): "XS",
        (17.5, 20): "S",
        (20, 23.5): "M",
        (23.5, 27): "L",
        (27, 31): "XL",
        (31, 100): "XXL",
    },
    "brand_adjustments": {
        "Zara": -1,       # Runs small: recommend one size up
        "H&M": 0,         # True to size
        "Levi's": 0,
        "Nike": 1,        # Runs large: recommend one size down
    }
}

STANDARD_CHART = [
    {"size": "XS", "chest": "34-36", "waist": "26-28"},
    {"size": "S", "chest": "36-38", "waist": "28-30"},
    {"size": "M", "chest": "38-40", "waist": "30-32"},
    {"size": "L", "chest": "40-42", "waist": "32-34"},
    {"size": "XL", "chest": "42-44", "waist": "34-36"},
    {"size": "XXL", "chest": "44-46", "waist": "36-38"},
]

SIZES_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]

def predict_size(height_cm: float, weight_kg: float, body_type: str = "regular", brand: str = None) -> dict:
    if height_cm <= 0 or weight_kg <= 0:
        return {"recommended_size": "Unknown", "confidence": 0, "bmi": 0}

    # 1. Calculate BMI
    height_m = height_cm / 100
    bmi = weight_kg / (height_m * height_m)

    # 2. Map BMI to base size
    base_size_idx = 2 # default M
    for (min_b, max_b), sz in SIZE_CHARTS["default"].items():
        if min_b <= bmi < max_b:
            base_size_idx = SIZES_ORDER.index(sz)
            break

    # 3. Adjust for body type
    type_adj = 0
    if body_type == "slim":
        type_adj = -0.5
    elif body_type in ["athletic", "plus"]:
        type_adj = +0.5

    # 4. Adjust for brand
    brand_adj = 0
    if brand:
        for b_name, adj in SIZE_CHARTS["brand_adjustments"].items():
            if b_name.lower() in brand.lower():
                brand_adj = adj
                break

    # Calculate final index
    final_idx_float = base_size_idx + type_adj + brand_adj
    final_idx = int(round(final_idx_float))
    
    # Clamp to available sizes
    final_idx = max(0, min(len(SIZES_ORDER) - 1, final_idx))
    recommended_size = SIZES_ORDER[final_idx]

    # Alternative size (if they are between sizes)
    alt_size = ""
    confidence = 85
    diff = final_idx_float - final_idx
    if diff > 0.25 and final_idx < len(SIZES_ORDER) - 1:
        alt_size = SIZES_ORDER[final_idx + 1]
        confidence = 65
    elif diff < -0.25 and final_idx > 0:
        alt_size = SIZES_ORDER[final_idx - 1]
        confidence = 65

    return {
        "recommended_size": recommended_size,
        "confidence": confidence,
        "alternative_size": alt_size,
        "bmi": round(bmi, 1),
        "size_chart": STANDARD_CHART
    }
