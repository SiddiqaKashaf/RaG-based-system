from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from ..database.db import get_db
from .loginPage import get_current_user

router = APIRouter()

class Activity(BaseModel):
    type: str
    description: str
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None

@router.post("/activities")
async def create_activity(
    activity: Activity,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO activities (
                type, description, user_id, organization_id,
                reference_id, reference_type
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            activity.type,
            activity.description,
            current_user["id"],
            current_user["organization_id"],
            activity.reference_id,
            activity.reference_type
        ))
        
        activity_id = cursor.fetchone()["id"]
        db.commit()
        
        return {
            "message": "Activity recorded successfully",
            "activity_id": activity_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/activities")
async def get_activities(
    activity_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        if activity_type:
            cursor.execute("""
                SELECT a.*, u.name as user_name
                FROM activities a
                JOIN users u ON a.user_id = u.id
                WHERE a.organization_id = %s AND a.type = %s
                ORDER BY a.created_at DESC
            """, (current_user["organization_id"], activity_type))
        else:
            cursor.execute("""
                SELECT a.*, u.name as user_name
                FROM activities a
                JOIN users u ON a.user_id = u.id
                WHERE a.organization_id = %s
                ORDER BY a.created_at DESC
            """, (current_user["organization_id"],))
        
        activities = cursor.fetchall()
        return activities
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/activities/types")
async def get_activity_types(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT DISTINCT type
            FROM activities
            WHERE organization_id = %s
            ORDER BY type
        """, (current_user["organization_id"],))
        
        types = cursor.fetchall()
        return types
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 