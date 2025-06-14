from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from ..database.db import get_db
from .loginPage import get_current_user

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    skills: Optional[list] = None
    achievements: Optional[list] = None
    education: Optional[list] = None
    experience: Optional[list] = None

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user), db: psycopg2.extensions.connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, email, name, role, department, phone, avatar_url, 
                   job_title, bio, location, linkedin, github, twitter,
                   skills, achievements, education, experience, organization_id
            FROM users 
            WHERE id = %s
        """, (current_user["id"],))
        
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        for field, value in profile_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = %s")
                values.append(value)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add user_id to values
        values.append(current_user["id"])
        
        # Execute update
        query = f"""
            UPDATE users 
            SET {', '.join(update_fields)}
            WHERE id = %s
            RETURNING id, email, name, role, department, phone, avatar_url,
                     job_title, bio, location, linkedin, github, twitter,
                     skills, achievements, education, experience, organization_id
        """
        
        cursor.execute(query, values)
        updated_user = cursor.fetchone()
        db.commit()
        
        return updated_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 