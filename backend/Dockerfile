# ---- Stage 1: Builder ----
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Stage 2: Production ----
FROM python:3.11-slim

# Install Tesseract OCR for screenshot fallback
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /install /usr/local

WORKDIR /app
COPY . .

# Download NLTK data needed for Sumy tokenizer
RUN python -c "import nltk; nltk.download('punkt_tab', download_dir='/usr/share/nltk_data'); nltk.download('stopwords', download_dir='/usr/share/nltk_data')"

# Railway dynamically assigns $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
