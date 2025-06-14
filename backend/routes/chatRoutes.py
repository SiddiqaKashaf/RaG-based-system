from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from ..database.db import get_db
from .loginPage import get_current_user
import os
import shutil
from datetime import datetime

router = APIRouter()

class ChatMessage(BaseModel):
    question: str
    context: Optional[str] = "general"

@router.post("/chat")
async def chat(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Log the chat activity
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO activities (type, user_id, action, target)
            VALUES (%s, %s, %s, %s)
        """, ("chat", current_user["id"], "asked", message.question))
        db.commit()

        # For now, return a simple response
        # TODO: Integrate with actual chat model
        return {
            "answer": "I'm here to help! This is a placeholder response. The actual chat functionality will be implemented soon.",
            "type": "general"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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

@router.get("/activities/recent")
async def get_recent_activities(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT a.*, u.name as user_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
            LIMIT 10
        """, (current_user["id"],))
        
        activities = cursor.fetchall()
        return activities
    except Exception as e:
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