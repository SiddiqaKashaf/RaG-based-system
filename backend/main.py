# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import sqlite3
from typing import Generator
import bcrypt

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
DB_NAME = "backend/users.db"

def get_db() -> Generator:
    conn = sqlite3.connect(DB_NAME)
    try:
        yield conn
    finally:
        conn.close()

# Initialize DB and create table
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Pydantic Models
class SignupModel(BaseModel):
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

# Signup Route
@app.post("/signup")
def signup(user: SignupModel, db: sqlite3.Connection = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    try:
        cursor = db.cursor()
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (user.email, hashed_password))
        db.commit()
        return {"message": "Signup successful"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

# Login Route
@app.post("/login")
def login(user: LoginModel, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT password FROM users WHERE email = ?", (user.email,))
    row = cursor.fetchone()
    if row and bcrypt.checkpw(user.password.encode('utf-8'), row[0]):
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
