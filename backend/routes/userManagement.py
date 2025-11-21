from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr
from backend.database.db import get_db

from backend.auth_utils import get_current_user

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/users")
async def get_users(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Check if user is admin
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can access user management"
            )
        
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, email, role, is_active, created_at
            FROM users
            WHERE organization_id = %s
            ORDER BY created_at DESC
        """, (current_user["organization_id"],))
        
        users = cursor.fetchall()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Check if user is admin
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can update users"
            )
        
        cursor = db.cursor()
        
        # Check if user exists and belongs to the same organization
        cursor.execute("""
            SELECT id FROM users 
            WHERE id = %s AND organization_id = %s
        """, (user_id, current_user["organization_id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        
        if user_update.name is not None:
            update_fields.append("name = %s")
            values.append(user_update.name)
        
        if user_update.email is not None:
            update_fields.append("email = %s")
            values.append(user_update.email)
        
        if user_update.role is not None:
            update_fields.append("role = %s")
            values.append(user_update.role)
        
        if user_update.is_active is not None:
            update_fields.append("is_active = %s")
            values.append(user_update.is_active)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add user_id to values
        values.append(user_id)
        
        # Execute update
        query = f"""
            UPDATE users 
            SET {', '.join(update_fields)}
            WHERE id = %s
            RETURNING id, name, email, role, is_active
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

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Check if user is admin
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete users"
            )
        
        cursor = db.cursor()
        
        # Check if user exists and belongs to the same organization
        cursor.execute("""
            SELECT id FROM users 
            WHERE id = %s AND organization_id = %s
        """, (user_id, current_user["organization_id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 