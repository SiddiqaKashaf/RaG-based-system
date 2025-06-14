import psycopg2
from psycopg2.extras import RealDictCursor
import os
from ..config import settings

def run_migrations():
    """Run database migrations"""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            database=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            port=settings.POSTGRES_PORT
        )
        cursor = conn.cursor()
        
        # Read and execute the migration file
        migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'add_response_time_column.sql')
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
            cursor.execute(migration_sql)
        
        conn.commit()
        print("Migration completed successfully")
    except Exception as e:
        print(f"Migration error: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migrations() 