import psycopg2
from config import settings

def test_connection():
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            database=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            port=settings.POSTGRES_PORT
        )
        print("Successfully connected to the database!")
        print(f"Connection details:")
        print(f"Host: {settings.POSTGRES_HOST}")
        print(f"Database: {settings.POSTGRES_DB}")
        print(f"User: {settings.POSTGRES_USER}")
        print(f"Port: {settings.POSTGRES_PORT}")
        conn.close()
    except Exception as e:
        print("Error connecting to the database:")
        print(str(e))

if __name__ == "__main__":
    test_connection() 