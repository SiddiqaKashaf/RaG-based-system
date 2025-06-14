from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..auth import get_current_user
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

router = APIRouter()

@router.get("/analytics")
async def get_analytics(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        return {
            "message": "Analytics endpoint is being reset"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

@router.get("/analytics/categories")
async def get_categories(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get all categories with document counts
        cursor.execute("""
            SELECT 
                c.id,
                c.name,
                c.description,
                COUNT(d.id) as document_count,
                MAX(d.created_at) as last_updated
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id
            GROUP BY c.id, c.name, c.description
            ORDER BY c.name
        """)
        
        categories = cursor.fetchall()
        
        # Format the response
        formatted_categories = []
        for cat in categories:
            formatted_categories.append({
                "id": cat["id"],
                "name": cat["name"],
                "description": cat["description"],
                "documentCount": cat["document_count"],
                "lastUpdated": cat["last_updated"].isoformat() if cat["last_updated"] else None
            })
        
        return formatted_categories
    except Exception as e:
        print(f"Error in get_categories: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Current user type: {type(current_user)}")
        print(f"Current user value: {current_user}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        ) 