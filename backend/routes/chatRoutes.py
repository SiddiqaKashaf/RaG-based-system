from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from backend.database.db import get_db
from backend.auth_utils import get_current_user
from backend.models.chat_models import ChatResponse, ChatHistoryItem, SaveChatRequest
from backend.utils import DocumentProcessor
import os
import shutil
from datetime import datetime
import logging
import uuid
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize chat message storage
CHAT_SESSIONS = {}  # In-memory storage for chat sessions (can be replaced with DB)

class AIResponseGenerator:
    """Generate AI responses based on context and documents"""
    
    @staticmethod
    def generate_response(question: str, context: str, documents_text: str = "", language: str = "en-US") -> tuple[str, List[str]]:
        """
        Generate AI response based on question, context, and documents
        Returns: (response_text, sources)
        """
        sources = []
        response = ""
        
        # Context-aware responses
        if context == "documents" and documents_text:
            response = AIResponseGenerator._search_in_documents(question, documents_text)
            if response:
                sources.append("Document Content")
        elif context == "general":
            response = AIResponseGenerator._general_response(question)
        elif context == "technical":
            response = AIResponseGenerator._technical_response(question)
        elif context == "business":
            response = AIResponseGenerator._business_response(question)
        else:
            response = AIResponseGenerator._general_response(question)
        
        # If no specific response, provide default
        if not response:
            response = f"I'm here to help with your question: '{question}'. However, I don't have specific information about this at the moment. Please provide more context or check our knowledge base."
        
        return response, sources
    
    @staticmethod
    def _search_in_documents(question: str, documents_text: str) -> str:
        """Search documents for relevant information"""
        # Simple keyword matching (can be enhanced with ML/NLP)
        question_words = question.lower().split()
        doc_lines = documents_text.split('\n')
        
        relevant_lines = []
        for line in doc_lines:
            line_lower = line.lower()
            if any(word in line_lower for word in question_words if len(word) > 3):
                relevant_lines.append(line)
        
        if relevant_lines:
            return '\n'.join(relevant_lines[:5])  # Return top 5 relevant lines
        return ""
    
    @staticmethod
    def _general_response(question: str) -> str:
        """Generate general response"""
        if "hello" in question.lower() or "hi" in question.lower():
            return "Hello! I'm here to assist you. How can I help you today?"
        elif "help" in question.lower():
            return "Of course! I can help you with:\n- Document search and analysis\n- General information queries\n- Technical support questions\n- Business-related inquiries\n\nWhat would you like to know?"
        elif "who" in question.lower() or "what" in question.lower():
            return "I'm an AI assistant designed to help you find information and answer your questions about the organization and our services."
        return ""
    
    @staticmethod
    def _technical_response(question: str) -> str:
        """Generate technical support response"""
        return f"For technical support regarding: {question}\n\nI recommend:\n1. Checking our technical documentation\n2. Visiting the FAQ section\n3. Contacting our technical support team\n\nPlease provide more details about your issue for better assistance."
    
    @staticmethod
    def _business_response(question: str) -> str:
        """Generate business-related response"""
        return f"Regarding your business inquiry: {question}\n\nI can help you with:\n- Company information\n- Services and offerings\n- Business processes\n- Partnership opportunities\n\nPlease let me know what specific information you need."

@router.post("/chat")
async def chat(
    question: str = Form(...),
    context: str = Form("general"),
    language: str = Form("en-US"),
    documents: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """
    Main chat endpoint that processes user messages and returns AI responses
    """
    cursor = None
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Validate question
        if not question or not question.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        # Process documents if provided
        documents_text = ""
        document_names = []
        if documents:
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in documents:
                if file and file.filename:
                    try:
                        # Extract text from document
                        extracted_text, filename = await DocumentProcessor.process_file(file)
                        documents_text += f"\n--- {filename} ---\n{extracted_text}"
                        document_names.append(filename)
                    except ValueError as ve:
                        logger.warning(f"Document processing error: {str(ve)}")
                        continue
                    except Exception as e:
                        logger.error(f"Error processing document {file.filename}: {str(e)}")
                        continue
        
        # Generate AI response
        answer, sources = AIResponseGenerator.generate_response(
            question=question,
            context=context,
            documents_text=documents_text,
            language=language
        )
        
        # Add document names to sources
        if document_names:
            sources.extend(document_names)
        
        # Log chat activity to database
        cursor.execute("""
            INSERT INTO activities (type, user_id, action, target, response_time)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            "chat",
            current_user["id"],
            "asked",
            question[:100],  # Store first 100 chars
            0  # Response time in ms
        ))
        
        # Save chat history if context indicates persistence is needed
        if context != "general":
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    question TEXT,
                    answer TEXT,
                    context VARCHAR(50),
                    language VARCHAR(10),
                    sources JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            cursor.execute("""
                INSERT INTO chat_history (user_id, question, answer, context, language, sources)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                current_user["id"],
                question,
                answer,
                context,
                language,
                str(sources)
            ))
        
        db.commit()
        
        return {
            "answer": answer,
            "type": context,
            "sources": sources,
            "language": language,
            "confidence": 0.95
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        if cursor:
            db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

@router.post("/chat/save-session")
async def save_chat_session(
    request: SaveChatRequest,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Save chat session for later reference"""
    try:
        cursor = db.cursor()
        
        session_id = str(uuid.uuid4())
        message_count = len(request.messages)
        
        # Create chat sessions table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(36) UNIQUE,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(255),
                context VARCHAR(50),
                messages JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            INSERT INTO chat_sessions (session_id, user_id, title, context, messages)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            session_id,
            current_user["id"],
            request.title,
            request.context or "general",
            json.dumps(request.messages)
        ))
        
        db.commit()
        
        return {
            "session_id": session_id,
            "title": request.title,
            "message_count": message_count,
            "created_at": datetime.now().isoformat()
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving chat session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving chat session: {str(e)}"
        )

@router.get("/chat/sessions")
async def get_chat_sessions(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Retrieve all saved chat sessions for the user"""
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT session_id, title, context, created_at, 
                   (SELECT COUNT(*) FROM (SELECT value FROM jsonb_array_elements(messages)) AS msgs) as message_count
            FROM chat_sessions
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 20
        """, (current_user["id"],))
        
        sessions = cursor.fetchall()
        return {"sessions": sessions if sessions else []}
    except Exception as e:
        logger.error(f"Error retrieving chat sessions: {str(e)}")
        return {"sessions": []}

@router.get("/chat/session/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Retrieve a specific chat session"""
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT session_id, title, context, messages, created_at
            FROM chat_sessions
            WHERE session_id = %s AND user_id = %s
        """, (session_id, current_user["id"]))
        
        session = cursor.fetchone()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving chat session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving chat session: {str(e)}"
        )

@router.delete("/chat/session/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Delete a specific chat session"""
    try:
        cursor = db.cursor()
        
        # Verify ownership
        cursor.execute("""
            SELECT session_id FROM chat_sessions
            WHERE session_id = %s AND user_id = %s
        """, (session_id, current_user["id"]))
        
        if not cursor.fetchone():
            cursor.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        # Delete the session
        cursor.execute("DELETE FROM chat_sessions WHERE session_id = %s", (session_id,))
        db.commit()
        cursor.close()
        
        return {"message": "Chat session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting chat session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting chat session: {str(e)}"
        )

@router.post("/query-doc")
async def query_document(
    file: UploadFile = File(...),
    question: str = Form(...),
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        # Save the file
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Log the document query activity
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO activities (type, user_id, action, target)
            VALUES (%s, %s, %s, %s)
        """, ("document_query", current_user["id"], "queried", file.filename))
        db.commit()

        # For now, return a simple response
        # TODO: Integrate with actual document query model
        return {
            "answer": f"I've received your question about {file.filename}. This is a placeholder response. The actual document query functionality will be implemented soon.",
            "type": "document",
            "sources": [file.filename]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/chat/activities/recent")
async def get_recent_activities(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        from psycopg2.extras import RealDictCursor
        cursor = db.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT a.*, u.name as user_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
            LIMIT 10
        """, (current_user["id"],))
        
        activities = cursor.fetchall()
        # Convert to list of dicts for JSON serialization
        return [dict(activity) for activity in activities] if activities else []
    except Exception as e:
        import traceback
        print(f"Error in get_recent_activities: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/analytics/search")
async def get_search_analytics(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM activities
            WHERE user_id = %s AND type IN ('chat', 'document_query')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        """, (current_user["id"],))
        
        analytics = cursor.fetchall()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 