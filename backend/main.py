# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Security, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
import sqlite3
from typing import Generator, Optional
import bcrypt
import shutil
import imghdr
import re
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import os

app = FastAPI()

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for avatars
AVATAR_DIR = "public/static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="public/static"), name="static")

# JWT secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key_here')

# Security
security = HTTPBearer()

# SQLite database path
DB_NAME = "backend/users.db"

def get_db() -> Generator:
    conn = sqlite3.connect(DB_NAME)
    try:
        yield conn
    finally:
        conn.close()

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT DEFAULT '',
            role TEXT DEFAULT 'Guest',
            department TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            avatar_url TEXT DEFAULT ''
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Pydantic models
class SignupModel(BaseModel):
    email: EmailStr
    password: str
    name: str = ""

class LoginModel(BaseModel):
    email: EmailStr
    password: str

# Authentication and user helpers
def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") != "Admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: sqlite3.Connection = Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
    except (ExpiredSignatureError, InvalidTokenError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    cursor = db.cursor()
    cursor.execute("SELECT id, email, name, role FROM users WHERE id = ?", (payload["id"],))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": row[0], "email": row[1], "name": row[2] or "", "role": row[3]}

# Signup
@app.post("/signup")
def signup(user: SignupModel, db: sqlite3.Connection = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            (user.email, hashed_password, user.name)
        )
        db.commit()
        return {"message": "Signup successful"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

# Login
@app.post("/login")
def login(user: LoginModel, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, password, role, name FROM users WHERE email = ?",
        (user.email,)
    )
    row = cursor.fetchone()

    if row:
        user_id, hashed_password, role, name = row

        # Check hashed password
        if bcrypt.checkpw(user.password.encode('utf-8'), hashed_password):

            # Generate JWT token with user info
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



# Admin-only routes
@app.get("/admin/users")
def list_users(db: sqlite3.Connection = Depends(get_db), admin=Depends(verify_admin_token)):
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, role FROM users")
    rows = cursor.fetchall()
    return {"users": [{"id": r[0], "name": r[1], "email": r[2], "role": r[3]} for r in rows]}

@app.patch("/admin/users/{user_id}/role")
def update_user_role(user_id: int, payload: dict, db: sqlite3.Connection = Depends(get_db), admin=Depends(verify_admin_token)):
    new_role = payload.get("role")
    if new_role not in ("Admin", "Analyst", "Guest"):
        raise HTTPException(status_code=400, detail="Invalid role")
    cursor = db.cursor()
    cursor.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    db.commit()
    return {"message": "Role updated"}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: sqlite3.Connection = Depends(get_db), admin=Depends(verify_admin_token)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    db.commit()
    return {"message": "User deleted"}

# Profile Routes
@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT department, phone, avatar_url FROM users WHERE id = ?", (current_user["id"],))
    row = cursor.fetchone() or ("", "", "")
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "department": row[0],
        "phone": row[1],
        "avatarUrl": f"/{row[2]}" if row[2] else ""
    }

@app.put("/api/profile", status_code=status.HTTP_204_NO_CONTENT)
def update_profile(
    role: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    avatar: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()

    if avatar:
        # Check image type before saving
        contents = avatar.file.read()
        avatar.file.seek(0)  # Reset file pointer after reading

        img_type = imghdr.what(None, h=contents)
        if img_type not in ("jpeg", "png", "jpg", "gif"):
            raise HTTPException(status_code=400, detail="Unsupported avatar image type")

        # Sanitize filename: remove any non-alphanumeric or dots/hyphens/underscores
        safe_filename = re.sub(r"[^a-zA-Z0-9._-]", "_", avatar.filename)
        avatar_filename = f"{current_user['id']}_{safe_filename}"
        avatar_path = os.path.join(AVATAR_DIR, avatar_filename)

        # Save file safely
        with open(avatar_path, "wb") as f:
            shutil.copyfileobj(avatar.file, f)

        avatar_url = f"static/avatars/{avatar_filename}"  # NO leading slash here for consistency
        cursor.execute("UPDATE users SET avatar_url = ? WHERE id = ?", (avatar_url, current_user["id"]))

    cursor.execute("""
        UPDATE users
        SET role = COALESCE(?, role),
            department = COALESCE(?, department),
            phone = COALESCE(?, phone)
        WHERE id = ?
    """, (role, department, phone, current_user["id"]))

    db.commit()
    

