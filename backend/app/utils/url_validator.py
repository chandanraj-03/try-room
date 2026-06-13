import re
from urllib.parse import urlparse


SUPPORTED_PLATFORMS = {
    "amazon": {
        "domains": ["amazon.in", "amazon.com", "www.amazon.in", "www.amazon.com"],
        "icon": "🛒",
        "name": "Amazon",
    },
    "flipkart": {
        "domains": ["flipkart.com", "www.flipkart.com", "dl.flipkart.com"],
        "icon": "🛍️",
        "name": "Flipkart",
    },
    "myntra": {
        "domains": ["myntra.com", "www.myntra.com"],
        "icon": "👗",
        "name": "Myntra",
    },
    "ajio": {
        "domains": ["ajio.com", "www.ajio.com"],
        "icon": "👔",
        "name": "Ajio",
    },
}


def validate_url(url: str) -> bool:
    """Basic URL validation."""
    pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$',
        re.IGNORECASE,
    )
    return bool(pattern.match(url))


def detect_platform(url: str) -> dict:
    """Detect e-commerce platform from URL domain."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        for key, platform in SUPPORTED_PLATFORMS.items():
            if any(d in domain for d in platform["domains"]):
                return {
                    "key": key,
                    "name": platform["name"],
                    "icon": platform["icon"],
                    "supported": True,
                }

        return {
            "key": "unknown",
            "name": "Unknown Platform",
            "icon": "🌐",
            "supported": False,
        }
    except Exception:
        return {"key": "unknown", "name": "Unknown", "icon": "🌐", "supported": False}
