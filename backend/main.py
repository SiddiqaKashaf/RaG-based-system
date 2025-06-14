# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Security, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Generator, Optional
import shutil
import imghdr
import re
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import os
import json
# Import your auth router
from .routes import loginPage, signupPage, profilePage, analyticsDashboard, uploadBooksPage, notificationPage, userManagement, chatRoutes
from .database.db import init_db
from .config import settings


app = FastAPI()

# Configure CORS
print("CORS Origins:", settings.CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(loginPage.router, prefix="/api", tags=["auth"])
app.include_router(signupPage.router, prefix="/api", tags=["auth"])
app.include_router(profilePage.router, prefix="/api", tags=["profile"])
app.include_router(analyticsDashboard.router, prefix="/api", tags=["analytics"])
app.include_router(uploadBooksPage.router, prefix="/api", tags=["knowledge"])
app.include_router(notificationPage.router, prefix="/api", tags=["activities"])
app.include_router(userManagement.router, prefix="/api", tags=["user management"])
app.include_router(chatRoutes.router, prefix="/api", tags=["chat"])

# Static files for avatars inside backend folder
BASE_DIR = os.path.dirname(__file__)
AVATAR_DIR = os.path.join(BASE_DIR, "public", "static", "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "public", "static")),
    name="static"
)

# JWT secret key
SECRET_KEY = settings.SECRET_KEY

# Security
security = HTTPBearer()

def get_db() -> Generator:
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        database=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        port=settings.POSTGRES_PORT,
        cursor_factory=RealDictCursor
    )
    try:
        yield conn
    finally:
        conn.close()

# Initialize database
def init_db():
    try:
        print("\nEnvironment Variables Check:")
        print("POSTGRES_USER from env:", os.getenv("POSTGRES_USER"))
        print("POSTGRES_PASSWORD from env:", "****" if os.getenv("POSTGRES_PASSWORD") else "None")
        print("POSTGRES_HOST from env:", os.getenv("POSTGRES_HOST"))
        print("POSTGRES_PORT from env:", os.getenv("POSTGRES_PORT"))
        print("POSTGRES_DB from env:", os.getenv("POSTGRES_DB"))
        
        print("\nSettings Values:")
        print(f"Host: {settings.POSTGRES_HOST}")
        print(f"Database: {settings.POSTGRES_DB}")
        print(f"User: {settings.POSTGRES_USER}")
        print(f"Port: {settings.POSTGRES_PORT}")
        print(f"Password is set: {'Yes' if settings.POSTGRES_PASSWORD else 'No'}")
        
        # Use connection string instead of individual parameters
        conn_string = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
        print("\nConnection string (password hidden):", conn_string.replace(settings.POSTGRES_PASSWORD, "****"))
        
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        # Table for organizations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            )
        """)

        # Table for users (linked to orgs)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee')),
                department VARCHAR(255) DEFAULT '',
                phone VARCHAR(50) DEFAULT '',
                avatar_url VARCHAR(255) DEFAULT '',
                job_title VARCHAR(255) DEFAULT '',
                bio TEXT DEFAULT '',
                location VARCHAR(255) DEFAULT '',
                linkedin VARCHAR(255) DEFAULT '',
                github VARCHAR(255) DEFAULT '',
                twitter VARCHAR(255) DEFAULT '',
                skills JSONB DEFAULT '[]',
                achievements JSONB DEFAULT '[]',
                education JSONB DEFAULT '[]',
                experience JSONB DEFAULT '[]',
                organization_id INTEGER REFERENCES organizations(id)
            )
        """)

        # Table for categories
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Insert default categories if they don't exist
        default_categories = [
            ("General", "General knowledge and information"),
            ("Technical", "Technical documentation and guides"),
            ("HR", "Human Resources related documents"),
            ("Finance", "Financial documents and procedures"),
            ("Projects", "Project related documentation")
        ]
        
        cursor.executemany("""
            INSERT INTO categories (name, description)
            VALUES (%s, %s)
            ON CONFLICT (name) DO NOTHING
        """, default_categories)

        # Table for documents
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                category_id INTEGER REFERENCES categories(id),
                file_type VARCHAR(50) DEFAULT 'Other',
                size_bytes BIGINT DEFAULT 0,
                uploaded_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table for activities
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id),
                action VARCHAR(255) NOT NULL,
                target VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

# Dependency to get current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except (ExpiredSignatureError, InvalidTokenError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    cursor = db.cursor()
    cursor.execute("SELECT id, email, name, role FROM users WHERE id = %s", (payload["sub"],))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": row["id"], "email": row["email"], "name": row["name"] or "", "role": row["role"]}

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("role", "").lower() != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Admin-only routes
@app.get("/admin/users")
def list_users(db: psycopg2.extensions.connection = Depends(get_db), admin=Depends(verify_admin_token)):
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, role FROM users")
    rows = cursor.fetchall()
    return {"users": [{"id": r["id"], "name": r["name"], "email": r["email"], "role": r["role"]} for r in rows]}

@app.patch("/admin/users/{user_id}/role")
def update_user_role(user_id: int, payload: dict, db: psycopg2.extensions.connection = Depends(get_db), admin=Depends(verify_admin_token)):
    new_role = payload.get("role", "").strip().lower()
    if new_role not in ("admin", "employee"):
        raise HTTPException(status_code=400, detail="Invalid role. Only 'admin' or 'employee' allowed.")
    
    cursor = db.cursor()
    cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    db.commit()
    return {"message": "Role updated"}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: psycopg2.extensions.connection = Depends(get_db), admin=Depends(verify_admin_token)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    db.commit()
    return {"message": "User deleted"}

# Profile Routes
@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user), db: psycopg2.extensions.connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT department, phone, avatar_url, job_title, bio, location, 
               linkedin, github, twitter, skills, achievements, education, experience 
        FROM users WHERE id = %s
    """, (current_user["id"],))
    row = cursor.fetchone() or {"department": "", "phone": "", "avatar_url": "", "job_title": "", "bio": "", 
                               "location": "", "linkedin": "", "github": "", "twitter": "", 
                               "skills": [], "achievements": [], "education": [], "experience": []}
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "department": row["department"],
        "phone": row["phone"],
        "avatarUrl": f"/{row['avatar_url']}" if row["avatar_url"] else "",
        "jobTitle": row["job_title"],
        "bio": row["bio"],
        "location": row["location"],
        "linkedin": row["linkedin"],
        "github": row["github"],
        "twitter": row["twitter"],
        "skills": row["skills"] if row["skills"] is not None else [],
        "achievements": row["achievements"] if row["achievements"] is not None else [],
        "education": row["education"] if row["education"] is not None else [],
        "experience": row["experience"] if row["experience"] is not None else []
    }

@app.put("/api/profile", status_code=status.HTTP_204_NO_CONTENT)
def update_profile(
    role: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    jobTitle: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    github: Optional[str] = Form(None),
    twitter: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    achievements: Optional[str] = Form(None),
    education: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    avatar: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    cursor = db.cursor()

    if role:
        role = role.strip().lower()
        if role not in ("admin", "employee"):
            raise HTTPException(status_code=400, detail="Invalid role. Only 'admin' or 'employee' allowed.")

    if avatar:
        contents = avatar.file.read()
        avatar.file.seek(0)
        img_type = imghdr.what(None, h=contents)
        if img_type not in ("jpeg", "png", "jpg", "gif"):
            raise HTTPException(status_code=400, detail="Unsupported avatar image type")

        safe_filename = re.sub(r"[^a-zA-Z0-9._-]", "_", avatar.filename)
        avatar_filename = f"{current_user['id']}_{safe_filename}"
        avatar_path = os.path.join(AVATAR_DIR, avatar_filename)

        with open(avatar_path, "wb") as f:
            shutil.copyfileobj(avatar.file, f)

        avatar_url = f"static/avatars/{avatar_filename}"
        cursor.execute("UPDATE users SET avatar_url = %s WHERE id = %s", (avatar_url, current_user["id"]))

    cursor.execute("""
        UPDATE users
        SET role = COALESCE(%s, role),
            department = COALESCE(%s, department),
            phone = COALESCE(%s, phone),
            job_title = %s,
            bio = COALESCE(%s, bio),
            location = COALESCE(%s, location),
            linkedin = COALESCE(%s, linkedin),
            github = COALESCE(%s, github),
            twitter = COALESCE(%s, twitter),
            skills = COALESCE(%s, skills),
            achievements = COALESCE(%s, achievements),
            education = COALESCE(%s, education),
            experience = COALESCE(%s, experience)
        WHERE id = %s
    """, (
        role, department, phone, jobTitle, bio, location,
        linkedin, github, twitter, skills, achievements,
        education, experience, current_user["id"]
    ))

    db.commit()

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

