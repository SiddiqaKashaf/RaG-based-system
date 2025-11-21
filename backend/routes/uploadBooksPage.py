from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from backend.database.db import get_db

from backend.auth_utils import get_current_user

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

@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: int,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Check if document exists and belongs to user's organization
        cursor.execute("""
            SELECT id FROM documents 
            WHERE id = %s AND organization_id = %s
        """, (doc_id, current_user["organization_id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete the document
        cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/documents/{doc_id}")
async def get_document(
    doc_id: int,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT d.*, u.name as uploaded_by_name, c.name as category_name
            FROM documents d
            JOIN users u ON d.uploaded_by = u.id
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE d.id = %s AND d.organization_id = %s
        """, (doc_id, current_user["organization_id"]))
        
        document = cursor.fetchone()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return document
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/documents/{doc_id}")
async def update_document(
    doc_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Check if document exists and belongs to user's organization
        cursor.execute("""
            SELECT id FROM documents 
            WHERE id = %s AND organization_id = %s
        """, (doc_id, current_user["organization_id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Build update query
        update_fields = []
        values = []
        
        if title is not None:
            update_fields.append("title = %s")
            values.append(title)
        
        if description is not None:
            update_fields.append("description = %s")
            values.append(description)
        
        if category is not None:
            update_fields.append("category = %s")
            values.append(category)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        values.append(doc_id)
        
        query = f"""
            UPDATE documents 
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, title, description, category, updated_at
        """
        
        cursor.execute(query, values)
        updated_doc = cursor.fetchone()
        db.commit()
        
        return updated_doc
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 