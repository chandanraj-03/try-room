"""
Review Analyzer Service
Uses VADER for sentiment analysis, Sumy (TextRank) for extractive summarization,
and scikit-learn (TF-IDF) for topic/keyword extraction. Lightweight and CPU-only.
"""
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from sklearn.feature_extraction.text import TfidfVectorizer
import re

# Pre-defined categories for grouping pros/cons
CATEGORIES = {
    "Fit & Size": ["fit", "size", "large", "small", "tight", "loose", "length", "width", "short", "long"],
    "Material & Quality": ["material", "fabric", "quality", "cotton", "polyester", "stitch", "thin", "thick", "soft", "rough"],
    "Comfort": ["comfortable", "comfort", "wear", "feel", "breathable", "heavy", "light"],
    "Appearance": ["color", "look", "style", "design", "beautiful", "ugly", "fade", "print", "pattern"],
    "Value": ["price", "worth", "money", "cheap", "expensive", "value", "cost"],
}

class ReviewAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        self.summarizer = TextRankSummarizer()
        self.stemmer = Stemmer("english")
        self.summarizer.stop_words = get_stop_words("english")

    def _clean_text(self, text: str) -> str:
        # Basic cleanup: remove excessive whitespace
        return re.sub(r'\s+', ' ', text).strip()

    def analyze_sentiment(self, reviews: list[dict]) -> dict:
        """Calculate sentiment for each review and aggregate."""
        if not reviews:
            return {
                "positive_pct": 0, "neutral_pct": 0, "negative_pct": 0,
                "average_compound": 0, "analyzed_reviews": []
            }

        pos_count = 0
        neu_count = 0
        neg_count = 0
        total_compound = 0
        analyzed_reviews = []

        for r in reviews:
            text = r.get("text", "")
            if not text:
                continue

            scores = self.vader.polarity_scores(text)
            compound = scores["compound"]
            total_compound += compound

            if compound >= 0.05:
                label = "positive"
                pos_count += 1
            elif compound <= -0.05:
                label = "negative"
                neg_count += 1
            else:
                label = "neutral"
                neu_count += 1

            r_copy = dict(r)
            r_copy["sentiment"] = {"compound": round(compound, 3), "label": label}
            analyzed_reviews.append(r_copy)

        total = len(analyzed_reviews)
        if total == 0:
            return {
                "positive_pct": 0, "neutral_pct": 0, "negative_pct": 0,
                "average_compound": 0, "analyzed_reviews": []
            }

        return {
            "positive_pct": round((pos_count / total) * 100, 1),
            "neutral_pct": round((neu_count / total) * 100, 1),
            "negative_pct": round((neg_count / total) * 100, 1),
            "average_compound": round(total_compound / total, 3),
            "analyzed_reviews": analyzed_reviews
        }

    def generate_summary(self, reviews: list[dict], sentences_count: int = 4) -> str:
        """Extractive summarization using Sumy's TextRank."""
        valid_reviews = [r.get("text", "") for r in reviews if len(r.get("text", "")) > 20]
        if not valid_reviews:
            return "Not enough detailed reviews to generate a summary."

        # Join all reviews into a single text block
        full_text = ". ".join(valid_reviews)
        
        try:
            parser = PlaintextParser.from_string(full_text, Tokenizer("english"))
            summary_sentences = self.summarizer(parser.document, sentences_count)
            return " ".join(str(s) for s in summary_sentences)
        except Exception:
            # Fallback if tokenizer fails
            return " ".join(valid_reviews[:3])

    def extract_pros_cons_topics(self, analyzed_reviews: list[dict]) -> tuple[list, list, list]:
        """
        Uses TF-IDF and VADER to extract key phrases and categorize them.
        Returns: (pros, cons, topics)
        """
        pos_texts = [r["text"] for r in analyzed_reviews if r["sentiment"]["label"] == "positive"]
        neg_texts = [r["text"] for r in analyzed_reviews if r["sentiment"]["label"] == "negative"]

        # Simple keyword extraction function
        def _get_top_keywords(texts, n=10):
            if not texts:
                return []
            try:
                vectorizer = TfidfVectorizer(stop_words='english', max_features=n, ngram_range=(1, 2))
                vectorizer.fit(texts)
                return vectorizer.get_feature_names_out().tolist()
            except ValueError:
                return []

        pos_keywords = _get_top_keywords(pos_texts, 15)
        neg_keywords = _get_top_keywords(neg_texts, 15)

        # Build human-readable pros/cons from keywords by finding a representative sentence
        pros = []
        for kw in pos_keywords[:5]:
            for text in pos_texts:
                if kw in text.lower():
                    # Extract the sentence containing the keyword
                    sentences = re.split(r'[.!?]', text)
                    for s in sentences:
                        if kw in s.lower() and len(s) > 10:
                            pros.append(s.strip()[:60] + "...")
                            break
                    break
        
        cons = []
        for kw in neg_keywords[:5]:
            for text in neg_texts:
                if kw in text.lower():
                    sentences = re.split(r'[.!?]', text)
                    for s in sentences:
                        if kw in s.lower() and len(s) > 10:
                            cons.append(s.strip()[:60] + "...")
                            break
                    break

        # Topic breakdown
        topic_stats = {cat: {"mentions": 0, "sentiment_sum": 0} for cat in CATEGORIES}
        
        for r in analyzed_reviews:
            text_lower = r["text"].lower()
            comp = r["sentiment"]["compound"]
            for cat, kws in CATEGORIES.items():
                if any(kw in text_lower for kw in kws):
                    topic_stats[cat]["mentions"] += 1
                    topic_stats[cat]["sentiment_sum"] += comp

        topics = []
        for cat, stats in topic_stats.items():
            if stats["mentions"] > 0:
                topics.append({
                    "topic": cat,
                    "mention_count": stats["mentions"],
                    "sentiment": round(stats["sentiment_sum"] / stats["mentions"], 2)
                })

        # Deduplicate pros/cons
        pros = list(set(pros))[:5]
        cons = list(set(cons))[:5]

        # Fallbacks if extraction failed
        if not pros and pos_texts:
            pros = [pos_texts[0][:60] + "..."]
        if not cons and neg_texts:
            cons = [neg_texts[0][:60] + "..."]

        return pros, cons, sorted(topics, key=lambda x: x["mention_count"], reverse=True)

    def full_analysis(self, reviews: list[dict]) -> dict:
        """Run the complete NLP pipeline."""
        sentiment_data = self.analyze_sentiment(reviews)
        summary = self.generate_summary(reviews)
        pros, cons, topics = self.extract_pros_cons_topics(sentiment_data["analyzed_reviews"])

        return {
            "sentiment_summary": {
                "positive_pct": sentiment_data["positive_pct"],
                "neutral_pct": sentiment_data["neutral_pct"],
                "negative_pct": sentiment_data["negative_pct"],
                "average_compound": sentiment_data["average_compound"]
            },
            "analyzed_reviews": sentiment_data["analyzed_reviews"],
            "summary_text": summary,
            "pros": pros,
            "cons": cons,
            "topics": topics
        }
