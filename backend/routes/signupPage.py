from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr
import bcrypt
from backend.database.db import get_db


router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str
    organization: str

@router.post("/signup")
async def signup(user: UserCreate, db: psycopg2.extensions.connection = Depends(get_db)):
    try:
        print("\n=== Signup Attempt ===")
        print(f"Email: {user.email}")
        print(f"Name: {user.name}")
        print(f"Organization: {user.organization}")
        
        cursor = db.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            print("Email already registered")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if organization exists
        cursor.execute("SELECT id FROM organizations WHERE name = %s", (user.organization,))
        org_row = cursor.fetchone()
        if org_row is None:
            # Organization does not exist, create it
            cursor.execute("INSERT INTO organizations (name) VALUES (%s) RETURNING id", (user.organization,))
            organization_id = cursor.fetchone()["id"]
            role = "admin"
            print(f"New organization created: {user.organization}, user will be admin.")
        else:
            organization_id = org_row["id"]
            role = "employee"
            print(f"Organization exists: {user.organization}, user will be employee.")
        
        # Hash password with proper salt
        try:
            print("Hashing password...")
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)
            hashed_password_str = hashed_password.decode('utf-8')
            print("Password hashed successfully")
        except Exception as e:
            print(f"Password hashing error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error hashing password"
            )
        
        # Insert new user
        try:
            cursor.execute("""
                INSERT INTO users (email, password, name, role, organization_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user.email,
                hashed_password_str,
                user.name,
                role,
                organization_id
            ))
            
            user_id = cursor.fetchone()["id"]
            print(f"User created successfully with ID: {user_id}")
            
            db.commit()
            return {"message": "Signup successful", "role": role}
        except Exception as e:
            print(f"Database error: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during signup: {str(e)}"
        ) 