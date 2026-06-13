import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.utils.auth_utils import get_current_user

try:
    import google.generativeai as genai
except ImportError:
    genai = None

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    success: bool

# Configure Gemini if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if genai and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are FashionAI, an expert virtual fashion stylist and personal shopper.
Your goal is to help users find the perfect outfits, understand fashion trends, and offer styling advice.
Be concise, friendly, and helpful. Format your responses with clear markdown.
If the user asks about sizing, remind them we have an AI Size Predictor tool.
If the user asks to see how something looks, remind them they can use our Virtual Try-On feature.
"""

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    # Fallback if Gemini is not configured
    if not genai or not GEMINI_API_KEY:
        # Simple rule-based fallback
        msg_lower = req.message.lower()
        if "size" in msg_lower or "fit" in msg_lower:
            reply = "I recommend using our AI Size Predictor on the product page! Just enter your height, weight, and body type."
        elif "try" in msg_lower or "look" in msg_lower:
            reply = "You can use our Virtual Try-On feature to see how clothes look on you in real-time."
        elif "match" in msg_lower or "color" in msg_lower:
            reply = "Neutral colors like black, white, and gray go with almost anything. For bolder looks, try complementary colors!"
        else:
            reply = "I am currently running in offline mode, but I can still answer basic questions about sizing and our features. Please set a GEMINI_API_KEY for advanced styling advice."
            
        return ChatResponse(reply=reply, success=True)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convert history format
        contents = []
        for msg in req.history:
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [msg.content]})
            
        # Add current message
        contents.append({"role": "user", "parts": [SYSTEM_PROMPT + "\n\nUser Query: " + req.message]})
        
        response = model.generate_content(contents)
        
        return ChatResponse(reply=response.text, success=True)
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(reply="Sorry, I'm having trouble connecting to my fashion database right now. Please try again later.", success=False)
