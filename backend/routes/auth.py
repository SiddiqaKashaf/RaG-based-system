# backend\routes\auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
import sqlite3
from typing import Generator
import bcrypt
import jwt
import os

# Router
router = APIRouter()

# JWT secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key_here')

# SQLite DB path
DB_NAME = "backend/users.db"

# Database dependency
def get_db() -> Generator:
    conn = sqlite3.connect(DB_NAME)
    try:
        yield conn
    finally:
        conn.close()

# Updated Pydantic model to match frontend fields
class SignupModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str
    organization: str
    role: str  # Will be either 'admin' or 'employee'


class LoginModel(BaseModel):
    email: EmailStr
    password: str

# Signup endpoint
@router.post("/signup")
def signup(user: SignupModel, db: sqlite3.Connection = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    role = user.role.lower()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    cursor = db.cursor()

   
    if  role == "admin":
        # Admin is creating a new org
        try:
            cursor.execute("INSERT INTO organizations (name) VALUES (?)", (user.organization,))
            org_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Organization already exists")
        
        cursor.execute("""
            INSERT INTO users (email, password, name, role, organization_id)
            VALUES (?, ?, ?, ?, ?)
        """, (user.email, hashed_password, user.name, 'admin', org_id))

    elif role == "employee":
        # Employee is joining an existing org
        cursor.execute("SELECT id FROM organizations WHERE name = ?", (user.organization,))
        org = cursor.fetchone()

        if not org:
            raise HTTPException(status_code=404, detail="No organization found with this name")

        org_id = org[0]
        cursor.execute("""
            INSERT INTO users (email, password, name, role, organization_id)
            VALUES (?, ?, ?, ?, ?)
        """, (user.email, hashed_password, user.name, 'employee', org_id))
    
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    db.commit()
    return {"message": "Signup successful"}




# Login endpoint (unchanged, just make sure `role` and `organization` exist in table)
@router.post("/login")
def login(user: LoginModel, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, password, role, name FROM users WHERE email = ?", (user.email,))
    row = cursor.fetchone()

    if row:
        user_id, hashed_password, role, name = row
        if bcrypt.checkpw(user.password.encode('utf-8'), hashed_password):
            token = jwt.encode(
                {"id": user_id, "email": user.email, "role": role, "name": name},
                SECRET_KEY,
                algorithm="HS256"
            )
            return {
                "message": "Login successful",
                "access_token": token,
                "user": {
                    "id": user_id,
                    "email": user.email,
                    "name": name,
                    "role": role
                }
            }

    raise HTTPException(status_code=401, detail="Invalid credentials")
