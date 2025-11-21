"""
Advanced RAG (Retrieval-Augmented Generation) Models
Handles document chunking, embeddings, and vector storage schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class DocumentChunk(BaseModel):
    """Represents a chunk of a document"""
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    content: str
    chunk_index: int
    start_char: int
    end_char: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tokens_count: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "chunk_id": "uuid-string",
                "document_id": "uuid-string",
                "content": "This is a chunk of text...",
                "chunk_index": 0,
                "start_char": 0,
                "end_char": 500,
                "metadata": {"source": "page_1", "section": "introduction"},
                "tokens_count": 75
            }
        }


class EmbeddingVector(BaseModel):
    """Stores embedding vectors for chunks"""
    embedding_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chunk_id: str
    document_id: str
    user_id: str
    embedding: List[float]  # Vector representation (typically 384-1536 dimensions)
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"  # Default model
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "embedding_id": "uuid-string",
                "chunk_id": "uuid-string",
                "document_id": "uuid-string",
                "user_id": "uuid-string",
                "embedding": [0.1, 0.2, -0.3, ...],  # 384 dimensions
                "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
                "created_at": "2025-01-01T12:00:00"
            }
        }


class DocumentMetadata(BaseModel):
    """Metadata for uploaded documents"""
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    file_type: str  # pdf, docx, txt
    file_size: int  # in bytes
    total_chunks: int
    total_tokens: int
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    processing_status: str = "pending"  # pending, processing, completed, failed
    error_message: Optional[str] = None
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "uuid-string",
                "user_id": "uuid-string",
                "filename": "research_paper.pdf",
                "file_type": "pdf",
                "file_size": 2048576,
                "total_chunks": 45,
                "total_tokens": 12500,
                "upload_date": "2025-01-01T12:00:00",
                "processing_status": "completed",
                "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
            }
        }


class RetrievedChunk(BaseModel):
    """Represents a chunk retrieved from similarity search"""
    chunk_id: str
    document_id: str
    content: str
    similarity_score: float  # 0-1, higher is better
    chunk_index: int
    metadata: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "chunk_id": "uuid-string",
                "document_id": "uuid-string",
                "content": "Relevant chunk content...",
                "similarity_score": 0.87,
                "chunk_index": 5,
                "metadata": {"source": "page_3", "section": "methods"}
            }
        }


class RAGChatRequest(BaseModel):
    """Advanced RAG chat request with document context"""
    question: str
    context: str = "documents"
    language: str = "en-US"
    documents: Optional[List[str]] = None  # Document IDs to search
    top_k: int = Field(default=5, ge=1, le=20)  # Number of chunks to retrieve
    similarity_threshold: float = Field(default=0.3, ge=0.0, le=1.0)
    use_reranking: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "What are the main findings?",
                "context": "documents",
                "language": "en-US",
                "documents": ["doc-id-1", "doc-id-2"],
                "top_k": 5,
                "similarity_threshold": 0.3,
                "use_reranking": True
            }
        }


class RAGChatResponse(BaseModel):
    """Advanced RAG chat response with retrieved context"""
    answer: str
    sources: List[RetrievedChunk]
    language: str
    confidence: float
    processing_time_ms: float
    model_used: str = "sentence-transformers/all-MiniLM-L6-v2"
    retrieval_count: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Based on the documents, the findings show...",
                "sources": [
                    {
                        "chunk_id": "uuid-string",
                        "document_id": "uuid-string",
                        "content": "Relevant content...",
                        "similarity_score": 0.92,
                        "chunk_index": 0,
                        "metadata": {"source": "page_1"}
                    }
                ],
                "language": "en-US",
                "confidence": 0.94,
                "processing_time_ms": 245.5,
                "model_used": "sentence-transformers/all-MiniLM-L6-v2",
                "retrieval_count": 5
            }
        }


class RerankingRequest(BaseModel):
    """Request for reranking retrieved chunks"""
    query: str
    chunks: List[RetrievedChunk]
    top_k: int = 3


class ProcessingStatus(BaseModel):
    """Document processing status"""
    document_id: str
    status: str
    progress_percentage: int
    chunks_processed: int
    total_chunks: int
    error: Optional[str] = None


class DocumentChunkWithoutVector(BaseModel):
    """Document chunk without vector data for API responses"""
    chunk_id: str
    document_id: str
    content: str
    chunk_index: int
    metadata: Dict[str, Any]


class UserDocumentIndex(BaseModel):
    """User's document index for search"""
    user_id: str
    document_count: int
    total_chunks: int
    total_tokens: int
    documents: List[DocumentMetadata]
    last_updated: datetime = Field(default_factory=datetime.utcnow)
