# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Security, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
import psycopg2

from psycopg2.extras import RealDictCursor
from typing import Optional
import shutil
import io
import re
import os
import json
# Import your auth router
from backend.routes import loginPage, signupPage, profilePage, analyticsDashboard, uploadBooksPage, userManagement, chatRoutes, contactPage, homePage, rag_routes, debug_routes
from backend.config import settings
from backend.auth_utils import get_current_user, get_db, verify_admin_token
from PIL import Image


app = FastAPI()

# Configure CORS - Permissive settings for development
print("CORS Origins:", settings.CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# Add preflight OPTIONS handler - must be before middleware
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    """Handle preflight CORS requests"""
    return Response(
        status_code=200,
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
            'Access-Control-Max-Age': '3600',
        }
    )


# Safety net: ensure responses include CORS header when middleware/route errors occur.
@app.middleware("http")
async def ensure_cors_header(request, call_next):
    # Get the origin from the request
    origin = request.headers.get('origin')
    
    # For OPTIONS requests (preflight), respond early with CORS headers
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                'Access-Control-Allow-Origin': origin or '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
                'Access-Control-Max-Age': '3600',
            }
        )
    
    # Process the request
    try:
        response = await call_next(request)
    except Exception as e:
        # Return error response with CORS headers
        response = Response(
            content=str(e),
            status_code=500,
        )
    
    # Add CORS headers to all responses
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin'
    
    return response

# Include routers
app.include_router(loginPage.router, prefix="/api", tags=["auth"])
app.include_router(signupPage.router, prefix="/api", tags=["auth"])
app.include_router(profilePage.router, prefix="/api", tags=["profile"])
app.include_router(analyticsDashboard.router, prefix="/api", tags=["analytics"])
app.include_router(uploadBooksPage.router, prefix="/api", tags=["knowledge"])
app.include_router(userManagement.router, prefix="/api", tags=["user management"])
app.include_router(chatRoutes.router, prefix="/api", tags=["chat"])
app.include_router(rag_routes.router, prefix="/api", tags=["rag"])
app.include_router(debug_routes.router, prefix="", tags=["internal"])
app.include_router(contactPage.router, prefix="/api", tags=["contact"])
app.include_router(homePage.router, prefix="/api", tags=["dashboard"])

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
                response_time INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table for contact submissions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                priority VARCHAR(50) DEFAULT 'normal',
                user_id INTEGER REFERENCES users(id),
                organization_id INTEGER REFERENCES organizations(id),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table for support tickets
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                priority VARCHAR(50) DEFAULT 'medium',
                user_id INTEGER REFERENCES users(id),
                organization_id INTEGER REFERENCES organizations(id),
                status VARCHAR(50) DEFAULT 'open',
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table for notifications
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                description TEXT,
                priority VARCHAR(50) DEFAULT 'medium',
                user_id INTEGER REFERENCES users(id),
                organization_id INTEGER REFERENCES organizations(id),
                reference_id INTEGER,
                reference_type VARCHAR(100),
                read_status BOOLEAN DEFAULT FALSE,
                archived BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table for analytics documents (saved uploaded files for analytics)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics_documents (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                filename VARCHAR(255) NOT NULL,
                document_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        """)

        # Add settings column to organizations table if it doesn't exist
        cursor.execute("""
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """)

        # Add response_time column to activities table if it doesn't exist
        cursor.execute("""
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS response_time INTEGER DEFAULT 0
        """)

        # Create chat_history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                question TEXT,
                answer TEXT,
                context VARCHAR(50),
                language VARCHAR(10),
                sources JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create chat_sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(36) UNIQUE,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(255),
                context VARCHAR(50),
                messages JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # RAG Advanced System Tables (PostgreSQL-compatible)
        # Namespaced table names (`rag_`) to avoid collisions with application documents
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rag_documents (
                document_id VARCHAR(36) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                filename VARCHAR(255) NOT NULL,
                file_type VARCHAR(20),
                file_size INTEGER,
                total_chunks INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processing_status VARCHAR(50) DEFAULT 'pending',
                error_message TEXT,
                embedding_model VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2'
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_doc_user ON rag_documents(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_doc_status ON rag_documents(processing_status)")

        # Document chunks table (RAG)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rag_document_chunks (
                chunk_id VARCHAR(36) PRIMARY KEY,
                document_id VARCHAR(36) NOT NULL,
                content TEXT NOT NULL,
                chunk_index INTEGER,
                start_char INTEGER,
                end_char INTEGER,
                tokens_count INTEGER,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES rag_documents(document_id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_chunk_doc ON rag_document_chunks(document_id)")

        # Embeddings table (RAG) - store as BYTEA
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rag_embeddings (
                embedding_id VARCHAR(36) PRIMARY KEY,
                chunk_id VARCHAR(36) NOT NULL,
                document_id VARCHAR(36) NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id),
                embedding BYTEA NOT NULL,
                embedding_model VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chunk_id) REFERENCES rag_document_chunks(chunk_id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_emb_user_doc ON rag_embeddings(user_id, document_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_emb_chunk ON rag_embeddings(chunk_id)")

        # RAG chat sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rag_chat_sessions (
                session_id VARCHAR(36) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                title VARCHAR(255),
                document_ids JSONB,
                total_messages INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_session_user ON rag_chat_sessions(user_id)")

        # RAG chat messages
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rag_chat_messages (
                message_id VARCHAR(36) PRIMARY KEY,
                session_id VARCHAR(36) NOT NULL,
                role VARCHAR(20),
                content TEXT,
                retrieved_chunks JSONB,
                confidence FLOAT,
                processing_time_ms FLOAT,
                tokens_used INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES rag_chat_sessions(session_id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_msg_session ON rag_chat_messages(session_id)")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()



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
        # Validate image using Pillow (imghdr is deprecated)
        try:
            image = Image.open(io.BytesIO(contents))
            img_type = (image.format or "").lower()
        except Exception:
            img_type = ""
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

