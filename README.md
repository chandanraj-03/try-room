# Try-Room (FashionAI Try-On & Review Platform)

Try-Room is an intelligent fashion e-commerce companion that empowers users to make better buying decisions through AI-powered review analysis, sizing predictions, and a virtual try-on experience. 

## 🌟 Key Features

* **Intelligent Product Analysis**: 
  * Paste a product URL (Amazon, Flipkart, Myntra, Ajio) or upload a screenshot.
  * Get a **Buy Confidence Score** (0-10) computed from sentiment, ratings, and review volume.
  * Extractive summarization and automatic extraction of Pros/Cons using NLP (VADER, Sumy TextRank, TF-IDF).
* **Virtual Try-On**: 
  * See how clothes look on you using interactive 3D modeling and computer vision (MediaPipe).
* **AI Size Predictor**: 
  * Stop guessing your size. Enter your height, weight, body type, and the brand to get a personalized size recommendation.
* **Smart Product Comparison**: 
  * Compare multiple products side-by-side across various dimensions like Price, Rating, and AI Buy Scores.
* **Fashion Assistant Chat**: 
  * AI-powered chat to help with fashion advice and product recommendations.

## 🛠️ Technology Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (for styling and animations)
* MediaPipe (for Virtual Try-On pose estimations)

**Backend:**
* Python & FastAPI
* MongoDB (Database)
* BeautifulSoup4 (Web scraping)
* VADER Sentiment (Sentiment analysis)
* Sumy (TextRank extractive summarization)
* scikit-learn (TF-IDF keyword extraction)

## 🚀 Getting Started

### Prerequisites
* Node.js & npm
* Python 3.9+
* MongoDB (running locally or a remote cluster)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (create a `.env` file in the `backend` folder):
   ```env
   mongodb_uri=mongodb://localhost:27017
   database_name=fashionai
   jwt_secret=your_jwt_secret_key
   allowed_origins=http://localhost:5173
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
try-room/
├── backend/
│   ├── app/
│   │   ├── models/       # Pydantic & DB models
│   │   ├── routes/       # API endpoints (Auth, Products, Comparison, etc.)
│   │   ├── services/     # Core logic (NLP Analysis, Scraping, OCR, Sizing)
│   │   ├── utils/        # Helpers (Auth utils, URL validation)
│   │   └── main.py       # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components & Layouts
    │   ├── context/      # React Context (Auth)
    │   ├── hooks/        # Custom hooks (MediaPipe, Camera)
    │   ├── pages/        # Page views (Analyze, Try-On, Compare)
    │   ├── services/     # API client (Axios)
    │   └── utils/        # Pose calculation utilities
    ├── package.json
    └── tailwind.config.js
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
