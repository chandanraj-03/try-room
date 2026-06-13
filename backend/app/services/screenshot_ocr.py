"""
Screenshot OCR Service — Fallback when URL scraping fails.
Uses pytesseract (Tesseract OCR) + OpenCV preprocessing to extract
product information from uploaded screenshot images.
"""
import re
import io
import cv2
import numpy as np
from PIL import Image

try:
    import pytesseract
except ImportError:
    pytesseract = None

# Known brands for matching
KNOWN_BRANDS = [
    "Nike", "Adidas", "Puma", "Reebok", "Levi's", "Levis", "H&M", "Zara",
    "Allen Solly", "Van Heusen", "Peter England", "Louis Philippe",
    "Raymond", "Arrow", "US Polo", "Tommy Hilfiger", "Calvin Klein",
    "ONLY", "Vero Moda", "Forever 21", "Mango", "FabIndia",
    "Biba", "W", "Aurelia", "Global Desi", "AND", "Roadster",
    "HRX", "Wrogn", "Bewakoof", "Max", "Pantaloons",
]


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Convert image bytes to preprocessed grayscale for better OCR."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    # Resize if too large (for speed)
    h, w = img.shape[:2]
    if max(h, w) > 2000:
        scale = 2000 / max(h, w)
        img = cv2.resize(img, None, fx=scale, fy=scale)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding for better text extraction
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return thresh


def extract_text_from_image(image_bytes: bytes) -> str:
    """Run OCR on image bytes. Returns raw text."""
    if pytesseract is None:
        return ""

    processed = preprocess_image(image_bytes)

    # Convert numpy array to PIL Image for pytesseract
    pil_image = Image.fromarray(processed)

    # Extract text using Tesseract
    text = pytesseract.image_to_string(pil_image, config="--psm 6")
    return text


def parse_product_from_text(raw_text: str) -> dict:
    """
    Parse extracted OCR text into structured product fields using
    regex patterns and heuristics.
    """
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    result = {
        "title": "",
        "brand": "",
        "price": 0.0,
        "rating": 0.0,
        "currency": "INR",
        "description": "",
        "category": "",
        "images": [],
    }

    # --- Extract price ---
    price_patterns = [
        r'[₹]\s*([\d,]+\.?\d*)',
        r'Rs\.?\s*([\d,]+\.?\d*)',
        r'INR\s*([\d,]+\.?\d*)',
        r'MRP\s*[:\s]*[₹]?\s*([\d,]+\.?\d*)',
        r'\$\s*([\d,]+\.?\d*)',
        r'Price\s*[:\s]*[₹$]?\s*([\d,]+\.?\d*)',
    ]
    for pattern in price_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            try:
                result["price"] = float(match.group(1).replace(",", ""))
                break
            except ValueError:
                continue

    # --- Extract rating ---
    rating_patterns = [
        r'(\d\.?\d?)\s*out\s*of\s*5',
        r'(\d\.?\d?)\s*/\s*5',
        r'(\d\.?\d?)\s*(?:star|stars|★)',
        r'Rating[:\s]*(\d\.?\d?)',
    ]
    for pattern in rating_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            try:
                r = float(match.group(1))
                if 0 < r <= 5:
                    result["rating"] = r
                    break
            except ValueError:
                continue

    # --- Extract brand ---
    text_upper = raw_text.upper()
    for brand in KNOWN_BRANDS:
        if brand.upper() in text_upper:
            result["brand"] = brand
            break

    # --- Extract title (heuristic: first long line that isn't a price) ---
    for line in lines:
        if len(line) > 10 and not re.search(r'[₹$]|rating|review|add to|buy now|cart', line, re.IGNORECASE):
            result["title"] = line[:150]
            break

    # --- Build description from remaining text ---
    desc_lines = [l for l in lines if len(l) > 20 and l != result["title"]]
    result["description"] = " ".join(desc_lines[:5])

    return result


def extract_from_screenshot(image_bytes: bytes) -> dict:
    """
    Main entry point: image bytes → structured product dict.
    Returns: {"success": bool, "product": dict, "raw_text": str}
    """
    try:
        raw_text = extract_text_from_image(image_bytes)

        if not raw_text or len(raw_text.strip()) < 10:
            return {
                "success": False,
                "product": {},
                "raw_text": "",
                "message": "Could not extract any text from the screenshot. Please try a clearer image.",
            }

        product = parse_product_from_text(raw_text)

        return {
            "success": True,
            "product": product,
            "raw_text": raw_text,
            "message": "Product info extracted from screenshot. Please review and correct any inaccuracies.",
        }

    except Exception as e:
        return {
            "success": False,
            "product": {},
            "raw_text": "",
            "message": f"Error processing screenshot: {str(e)}",
        }
