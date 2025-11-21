"""
Chat-related Pydantic models for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    """Chat message model"""
    question: str
    context: Optional[str] = "general"
    language: Optional[str] = "en-US"

class ChatResponse(BaseModel):
    """Chat response model"""
    answer: str
    sources: Optional[List[str]] = []
    language: Optional[str] = "en-US"
    confidence: Optional[float] = 0.95

class ChatHistoryItem(BaseModel):
    """Chat history item"""
    id: Optional[int] = None
    user_id: int
    question: str
    answer: str
    context: str
    language: str
    sources: Optional[List[str]] = []
    created_at: Optional[datetime] = None

class SaveChatRequest(BaseModel):
    """Request to save chat session"""
    title: str
    messages: List[dict]
    context: Optional[str] = "general"

class ChatSessionResponse(BaseModel):
    """Chat session response"""
    session_id: str
    title: str
    created_at: datetime
    message_count: int
