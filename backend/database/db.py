import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Generator
import os
from ..config import settings

def get_db() -> Generator:
    """Database connection dependency"""
    try:
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
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        print(f"Connection details:")
        print(f"Host: {settings.POSTGRES_HOST}")
        print(f"Database: {settings.POSTGRES_DB}")
        print(f"User: {settings.POSTGRES_USER}")
        print(f"Port: {settings.POSTGRES_PORT}")
        raise

def init_db():
    """Initialize database with required tables"""
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        database=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        port=settings.POSTGRES_PORT
    )
    cursor = conn.cursor()
    
    # Table for organizations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
            organization_id INTEGER REFERENCES organizations(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Table for documents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            file_path VARCHAR(255),
            file_type VARCHAR(50),
            size_bytes BIGINT DEFAULT 0,
            organization_id INTEGER REFERENCES organizations(id),
            uploaded_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Table for activities (for tracking user actions and analytics)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL CHECK (type IN ('search', 'upload', 'download', 'view')),
            user_id INTEGER REFERENCES users(id),
            organization_id INTEGER REFERENCES organizations(id),
            document_id INTEGER REFERENCES documents(id),
            query_text TEXT,
            response_time_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create indexes for better query performance
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(organization_id);
        CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
        CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
        CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(organization_id);
        CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
    """)
    
    conn.commit()
    conn.close() 