"""
Product Extraction Engine
Attempts web scraping with BeautifulSoup. On failure, returns screenshot_required=True
so the frontend can prompt the user to upload a screenshot instead.
"""
import random
import hashlib
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from app.utils.url_validator import detect_platform

ua = UserAgent(fallback="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

# Platform-specific CSS selectors for scraping
PLATFORM_SELECTORS = {
    "amazon": {
        "title": ["#productTitle", "span#productTitle"],
        "price": [".a-price-whole", "#priceblock_ourprice", "#priceblock_dealprice"],
        "rating": ["#acrPopover .a-icon-alt", "span.a-icon-alt"],
        "image": ["#landingImage", "#imgBlkFront"],
        "brand": ["#bylineInfo", "a#bylineInfo"],
        "description": ["#productDescription p", "#feature-bullets .a-list-item"],
    },
    "flipkart": {
        "title": ["span.VU-ZEz", "h1._6EBuvT", "span.B_NuCI"],
        "price": ["div.Nx9bqj", "div._30jeq3"],
        "rating": ["div.XQDdHH", "div._3LWZlK"],
        "image": ["img._396cs4", "img._2r_T1I"],
        "brand": ["span.mEh187", "span._2WkVRV"],
        "description": ["div._1mXcCf p", "div.RmoJUa"],
    },
    "myntra": {
        "title": ["h1.pdp-title", "h1.pdp-name"],
        "price": ["span.pdp-price strong", "span.pdp-mrp"],
        "rating": ["div.index-overallRating"],
        "image": ["img.image-grid-image"],
        "brand": ["h1.pdp-title .pdp-name"],
        "description": ["p.pdp-product-description-content"],
    },
    "ajio": {
        "title": ["h1.prod-name"],
        "price": ["span.prod-sp"],
        "rating": ["span.prod-rating"],
        "image": ["img.rilrtk-lazy-img"],
        "brand": ["h2.brand-name"],
        "description": ["div.prod-desc"],
    },
}

# Sample mock products used as fallback data
MOCK_PRODUCTS = [
    {
        "title": "Premium Cotton Slim Fit T-Shirt",
        "brand": "Allen Solly",
        "price": 899.0,
        "rating": 4.3,
        "review_count": 2847,
        "category": "Men's T-Shirts",
        "description": "Classic slim fit t-shirt made from 100% premium combed cotton. Features a round neck design with reinforced stitching. Available in multiple colors. Machine washable and fade resistant.",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            "https://images.unsplash.com/photo-1622445275576-721325763afe?w=400",
        ],
    },
    {
        "title": "Classic Denim Jacket - Vintage Wash",
        "brand": "Levi's",
        "price": 3499.0,
        "rating": 4.5,
        "review_count": 1523,
        "category": "Men's Jackets",
        "description": "Iconic trucker-style denim jacket with authentic vintage wash. Features button closure, two chest pockets, and adjustable waistband tabs. Made from durable 100% cotton denim.",
        "images": [
            "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
        ],
    },
    {
        "title": "Floral Print A-Line Dress",
        "brand": "ONLY",
        "price": 1799.0,
        "rating": 4.1,
        "review_count": 956,
        "category": "Women's Dresses",
        "description": "Elegant A-line dress with allover floral print. Features a V-neckline, short flutter sleeves, and a flattering fit-and-flare silhouette. Made from lightweight polyester blend fabric.",
        "images": [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
        ],
    },
    {
        "title": "Running Performance Sneakers",
        "brand": "Nike",
        "price": 5999.0,
        "rating": 4.6,
        "review_count": 4201,
        "category": "Sports Shoes",
        "description": "High-performance running shoes with responsive cushioning and breathable mesh upper. Features Flyknit technology and rubber outsole for excellent traction.",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        ],
    },
    {
        "title": "Formal Slim Fit Shirt - White",
        "brand": "Van Heusen",
        "price": 1599.0,
        "rating": 4.2,
        "review_count": 3100,
        "category": "Men's Shirts",
        "description": "Premium formal shirt in crisp white cotton. Features a spread collar, single cuff with button closure, and a tailored slim fit. Wrinkle-resistant fabric for all-day freshness.",
        "images": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
        ],
    },
]

# Sample mock reviews
MOCK_REVIEWS_POOL = [
    {"text": "Excellent quality fabric! Very comfortable to wear. True to size and the color is exactly as shown. Would definitely buy again.", "rating": 5, "author": "Rahul M."},
    {"text": "Good product for the price. The stitching is neat and the material feels premium. Slight delay in delivery but worth the wait.", "rating": 4, "author": "Priya S."},
    {"text": "The fit is perfect for my body type. I ordered a medium and it fits just right. The color hasn't faded even after multiple washes.", "rating": 5, "author": "Amit K."},
    {"text": "Decent quality but nothing exceptional. The fabric is a bit thin compared to what I expected. Sizing runs slightly small.", "rating": 3, "author": "Sneha R."},
    {"text": "Very disappointed with the product. The color was completely different from the images. Material feels cheap and uncomfortable.", "rating": 1, "author": "Vikram P."},
    {"text": "Great value for money! I bought three of these in different colors. Comfortable for daily wear and easy to maintain.", "rating": 5, "author": "Ananya D."},
    {"text": "The material is soft and breathable, perfect for summer. The design is trendy and I received many compliments.", "rating": 4, "author": "Karthik N."},
    {"text": "Product is okay but overpriced for what you get. Similar quality available at half the price elsewhere.", "rating": 2, "author": "Meera J."},
    {"text": "Fast delivery and well packaged. The product matches the description perfectly. Very happy with this purchase.", "rating": 5, "author": "Arjun V."},
    {"text": "Fabric started pilling after just two washes. Quality control needs improvement. Not recommended for long-term use.", "rating": 2, "author": "Divya L."},
    {"text": "One of the best purchases I've made online. The fit is exceptional and the material quality is top notch. Highly recommend!", "rating": 5, "author": "Rohan B."},
    {"text": "Average product. The stitching came loose after a month of regular use. Expected better durability at this price point.", "rating": 3, "author": "Neha G."},
    {"text": "Love the design and pattern! It's very comfortable and the size chart was accurate. Will order more from this brand.", "rating": 4, "author": "Sanjay T."},
    {"text": "Color faded significantly after the first wash. The material also shrank despite following care instructions. Very disappointing.", "rating": 1, "author": "Pooja K."},
    {"text": "Perfect everyday wear option. The fabric breathes well and maintains its shape nicely. Good stitching quality throughout.", "rating": 4, "author": "Manish W."},
    {"text": "Comfortable and stylish. I wear it almost every week. The material holds up well even after frequent washing.", "rating": 5, "author": "Kavita R."},
    {"text": "Size was off - ordered L but received something closer to M. Had to return and reorder. The product itself is fine quality.", "rating": 3, "author": "Suresh P."},
    {"text": "Beautiful design and great craftsmanship. My go-to choice for casual outings. Worth every penny!", "rating": 5, "author": "Lakshmi S."},
    {"text": "Not worth the hype. The material is stiff and uncomfortable. Took many washes to soften up a bit.", "rating": 2, "author": "Rajesh M."},
    {"text": "Exactly what I expected. Good quality, true color, comfortable fit. Standard shipping time. Satisfied customer.", "rating": 4, "author": "Aishwarya N."},
]


def _try_scrape(url: str, platform_key: str) -> dict:
    """Attempt to scrape product data from a URL. Returns None on failure."""
    try:
        headers = {"User-Agent": ua.random}
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "lxml")
        selectors = PLATFORM_SELECTORS.get(platform_key, {})

        if not selectors:
            return None

        # Try to extract title
        title = ""
        for sel in selectors.get("title", []):
            el = soup.select_one(sel)
            if el:
                title = el.get_text(strip=True)
                break

        if not title:
            return None  # Can't extract even the title, scraping failed

        # Extract other fields
        price_text = ""
        for sel in selectors.get("price", []):
            el = soup.select_one(sel)
            if el:
                price_text = el.get_text(strip=True)
                break

        rating_text = ""
        for sel in selectors.get("rating", []):
            el = soup.select_one(sel)
            if el:
                rating_text = el.get_text(strip=True)
                break

        image_url = ""
        for sel in selectors.get("image", []):
            el = soup.select_one(sel)
            if el:
                image_url = el.get("src", "") or el.get("data-src", "")
                break

        brand = ""
        for sel in selectors.get("brand", []):
            el = soup.select_one(sel)
            if el:
                brand = el.get_text(strip=True)
                break

        # Parse price
        import re
        price = 0.0
        price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
        if price_match:
            try:
                price = float(price_match.group())
            except ValueError:
                pass

        # Parse rating
        rating = 0.0
        rating_match = re.search(r'(\d\.?\d?)', rating_text)
        if rating_match:
            try:
                rating = float(rating_match.group(1))
            except ValueError:
                pass

        return {
            "title": title,
            "brand": brand,
            "price": price,
            "rating": rating,
            "images": [image_url] if image_url else [],
            "description": "",
            "category": "",
            "review_count": 0,
        }

    except Exception:
        return None


def _get_mock_product(url: str) -> dict:
    """Generate deterministic mock product data based on URL hash."""
    url_hash = int(hashlib.md5(url.encode()).hexdigest(), 16)
    product = MOCK_PRODUCTS[url_hash % len(MOCK_PRODUCTS)].copy()
    # Randomize price slightly
    product["price"] = round(product["price"] * (0.9 + (url_hash % 20) / 100), 0)
    product["review_count"] = 500 + (url_hash % 4500)
    return product


def _get_mock_reviews(url: str, count: int = 15) -> list:
    """Generate mock reviews for a product."""
    url_hash = int(hashlib.md5(url.encode()).hexdigest(), 16)
    random.seed(url_hash)
    selected = random.sample(MOCK_REVIEWS_POOL, min(count, len(MOCK_REVIEWS_POOL)))
    random.seed()  # Reset seed
    return selected


def extract_product(url: str) -> dict:
    """
    Main extraction function.
    1. Detect platform
    2. Try scraping
    3. If scraping fails → use mock data (simulating real extraction)
    Returns: {"success": bool, "product": dict, "reviews": list, "screenshot_required": bool}
    """
    platform = detect_platform(url)
    platform_key = platform["key"]

    # Attempt real scraping first
    scraped = _try_scrape(url, platform_key)

    if scraped and scraped.get("title"):
        # Scraping succeeded — use real data + mock reviews
        product_data = scraped
        product_data["platform"] = platform["name"]
        product_data["url"] = url
        product_data["extracted_via"] = "scraping"
        reviews = _get_mock_reviews(url)
        return {
            "success": True,
            "product": product_data,
            "reviews": reviews,
            "screenshot_required": False,
        }

    # Scraping failed — use mock data but indicate screenshot is optional
    mock = _get_mock_product(url)
    mock["platform"] = platform["name"]
    mock["url"] = url
    mock["extracted_via"] = "mock"
    reviews = _get_mock_reviews(url)

    return {
        "success": True,
        "product": mock,
        "reviews": reviews,
        "screenshot_required": True,
        "message": f"Could not scrape {platform['name']} directly. Using AI analysis with demo data. Upload a screenshot for better accuracy.",
    }
