from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from ..database.db import get_db
from .loginPage import get_current_user

router = APIRouter()

class Document(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = None,
    description: str = None,
    category: str = None,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Save file logic here
        # For now, we'll just store the metadata
        cursor = db.cursor()
        
        cursor.execute("""
            INSERT INTO documents (
                title, description, category, file_name, 
                file_type, uploaded_by, organization_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            title or file.filename,
            description,
            category,
            file.filename,
            file.content_type,
            current_user["id"],
            current_user["organization_id"]
        ))
        
        document_id = cursor.fetchone()["id"]
        db.commit()
        
        return {
            "message": "Document uploaded successfully",
            "document_id": document_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/documents")
async def get_documents(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        if category:
            cursor.execute("""
                SELECT d.*, u.name as uploaded_by_name
                FROM documents d
                JOIN users u ON d.uploaded_by = u.id
                WHERE d.organization_id = %s AND d.category = %s
                ORDER BY d.created_at DESC
            """, (current_user["organization_id"], category))
        else:
            cursor.execute("""
                SELECT d.*, u.name as uploaded_by_name
                FROM documents d
                JOIN users u ON d.uploaded_by = u.id
                WHERE d.organization_id = %s
                ORDER BY d.created_at DESC
            """, (current_user["organization_id"],))
        
        documents = cursor.fetchall()
        return documents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/documents/categories")
async def get_categories(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT DISTINCT category
            FROM documents
            WHERE organization_id = %s
            ORDER BY category
        """, (current_user["organization_id"],))
        
        categories = cursor.fetchall()
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 