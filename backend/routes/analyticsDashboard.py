from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from backend.database.db import get_db
from backend.auth_utils import get_current_user
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pandas as pd
import io
import json

router = APIRouter()

@router.get("/analytics")
async def get_analytics(
    start_date: str = None,
    end_date: str = None,
    time_range: str = "30d",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Set default date range if not provided
        if not start_date:
            if time_range == "7d":
                start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            elif time_range == "30d":
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            elif time_range == "90d":
                start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            else:
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Get analytics data for the date range
        cursor.execute("""
            SELECT 
                DATE(created_at) as day,
                COUNT(*) as queries,
                COUNT(CASE WHEN type = 'document_query' THEN 1 END) as document_queries,
                COUNT(CASE WHEN type = 'chat' THEN 1 END) as chat_queries,
                AVG(CASE WHEN response_time IS NOT NULL THEN response_time END) as avg_response_time
            FROM activities 
            WHERE user_id = %s 
            AND created_at >= %s 
            AND created_at <= %s
            GROUP BY DATE(created_at)
            ORDER BY day
        """, (current_user["id"], start_date, end_date))
        
        activity_data = cursor.fetchall()
        
        # Get RAG document uploads
        upload_data = []
        try:
            cursor.execute("""
                SELECT 
                    DATE(upload_date) as day,
                    COUNT(*) as uploads
                FROM rag_documents 
                WHERE user_id = %s 
                AND upload_date >= %s 
                AND upload_date <= %s
                GROUP BY DATE(upload_date)
                ORDER BY day
            """, (current_user["id"], start_date, end_date))
            upload_data = cursor.fetchall()
        except psycopg2.Error:
            upload_data = []
        
        # Also get regular document uploads if table exists
        try:
            cursor.execute("""
                SELECT 
                    DATE(created_at) as day,
                    COUNT(*) as uploads
                FROM documents 
                WHERE uploaded_by = %s 
                AND created_at >= %s 
                AND created_at <= %s
                GROUP BY DATE(created_at)
                ORDER BY day
            """, (current_user["id"], start_date, end_date))
            doc_uploads = cursor.fetchall()
            # Merge with RAG uploads
            for doc_up in doc_uploads:
                day_str = doc_up['day'].strftime('%Y-%m-%d')
                existing = next((u for u in upload_data if u['day'].strftime('%Y-%m-%d') == day_str), None)
                if existing:
                    existing['uploads'] += doc_up['uploads']
                else:
                    upload_data.append(doc_up)
        except psycopg2.Error:
            pass
        
        # Get active users count (for admin) or user's own activity
        user_data = []
        try:
            # Check if user is admin
            cursor.execute("SELECT role FROM users WHERE id = %s", (current_user["id"],))
            user_role = cursor.fetchone()
            
            if user_role and user_role.get('role') == 'admin':
                # Admin sees all active users
                cursor.execute("""
                    SELECT 
                        DATE(created_at) as day,
                        COUNT(DISTINCT user_id) as active_users
                    FROM activities 
                    WHERE created_at >= %s 
                    AND created_at <= %s
                    GROUP BY DATE(created_at)
                    ORDER BY day
                """, (start_date, end_date))
            else:
                # Employee sees their own activity count
                cursor.execute("""
                    SELECT 
                        DATE(created_at) as day,
                        COUNT(*) as active_users
                    FROM activities 
                    WHERE user_id = %s 
                    AND created_at >= %s 
                    AND created_at <= %s
                    GROUP BY DATE(created_at)
                    ORDER BY day
                """, (current_user["id"], start_date, end_date))
            user_data = cursor.fetchall()
        except psycopg2.Error:
            user_data = []
        
        # Combine data into daily analytics
        analytics_data = []
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
        
        while current_date <= end_datetime:
            day_str = current_date.strftime('%Y-%m-%d')
            day_display = current_date.strftime('%b %d')
            
            # Find matching data
            activity = next((a for a in activity_data if a['day'].strftime('%Y-%m-%d') == day_str), None)
            uploads = next((u for u in upload_data if u['day'].strftime('%Y-%m-%d') == day_str), None)
            users = next((u for u in user_data if u['day'].strftime('%Y-%m-%d') == day_str), None)
            
            analytics_data.append({
                "day": day_display,
                "queries": activity['queries'] if activity else 0,
                "uploads": uploads['uploads'] if uploads else 0,
                "users": users['active_users'] if users else 0,
                "successRate": 95,  # Mock success rate
                "responseTime": round(activity['avg_response_time'] if activity and activity['avg_response_time'] else 150, 0)
            })
            
            current_date += timedelta(days=1)
        
        # Get total counts for summary
        total_queries = sum(d['queries'] for d in analytics_data)
        total_uploads = sum(d['uploads'] for d in analytics_data)
        
        # Get actual total counts from database
        try:
            cursor.execute("""
                SELECT COUNT(*) as total
                FROM activities 
                WHERE user_id = %s 
                AND created_at >= %s 
                AND created_at <= %s
            """, (current_user["id"], start_date, end_date))
            actual_queries = cursor.fetchone()['total'] or 0
            
            cursor.execute("""
                SELECT COUNT(*) as total
                FROM rag_documents 
                WHERE user_id = %s 
                AND upload_date >= %s 
                AND upload_date <= %s
            """, (current_user["id"], start_date, end_date))
            actual_uploads = cursor.fetchone()['total'] or 0
            
            # Get active users count (for admin)
            cursor.execute("SELECT role FROM users WHERE id = %s", (current_user["id"],))
            user_role = cursor.fetchone()
            if user_role and user_role.get('role') == 'admin':
                cursor.execute("""
                    SELECT COUNT(DISTINCT user_id) as total
                    FROM activities 
                    WHERE created_at >= %s 
                    AND created_at <= %s
                """, (start_date, end_date))
                active_users = cursor.fetchone()['total'] or 0
            else:
                active_users = 1  # Employee sees themselves
        except psycopg2.Error:
            actual_queries = total_queries
            actual_uploads = total_uploads
            active_users = 1
        
        return {
            "analytics_data": analytics_data,
            "summary": {
                "total_queries": actual_queries,
                "total_uploads": actual_uploads,
                "active_users": active_users,
                "avg_users_per_day": round(sum(d['users'] for d in analytics_data) / len(analytics_data), 1) if analytics_data else 0,
                "avg_response_time": round(sum(d['responseTime'] for d in analytics_data) / len(analytics_data), 0) if analytics_data else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

@router.get("/analytics/categories")
async def get_categories(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Get all categories with document counts
        try:
            cursor.execute("""
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    COUNT(d.id) as document_count,
                    MAX(d.created_at) as last_updated
                FROM categories c
                LEFT JOIN documents d ON c.id = d.category_id
                GROUP BY c.id, c.name, c.description
                ORDER BY c.name
            """)
            
            categories = cursor.fetchall()
            
            # Format the response
            formatted_categories = []
            for cat in categories:
                formatted_categories.append({
                    "id": cat["id"],
                    "name": cat["name"],
                    "description": cat["description"],
                    "documentCount": cat["document_count"],
                    "lastUpdated": cat["last_updated"].isoformat() if cat["last_updated"] else None
                })
            
            return formatted_categories
        except psycopg2.Error:
            # Table might not exist, return empty list
            return []
            
    except Exception as e:
        print(f"Error in get_categories: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Current user type: {type(current_user)}")
        print(f"Current user value: {current_user}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )

@router.post("/analytics/upload-data")
async def upload_data_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload CSV or Excel file and return chart-ready data"""
    try:
        # Helper function to clean NaN and other non-JSON-serializable values
        def clean_for_json(obj):
            """Convert NaN, Infinity, and other non-JSON-serializable values to None"""
            import math
            if isinstance(obj, dict):
                return {k: clean_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_for_json(item) for item in obj]
            elif isinstance(obj, float):
                # Convert NaN and Infinity to None
                if math.isnan(obj) or math.isinf(obj):
                    return None
                return obj
            return obj
        
        # Read file content
        contents = await file.read()
        
        # Determine file type
        file_ext = file.filename.split('.')[-1].lower() if file.filename else ''
        
        # Parse file based on extension
        if file_ext in ['csv']:
            df = pd.read_csv(io.BytesIO(contents))
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload CSV or Excel file."
            )
        
        # Replace NaN values with None for JSON serialization
        df = df.where(pd.notna(df), None)
        
        # Convert DataFrame to JSON for frontend
        # Get column names
        columns = df.columns.tolist()
        
        # Convert to records format
        records = df.to_dict('records')
        # Clean the records to remove any remaining NaN values
        records = clean_for_json(records)
        
        # Get numeric columns for charting (include int, float, and numeric string columns)
        # Filter out text columns - only include numeric types
        numeric_columns = df.select_dtypes(include=['number', 'int64', 'float64', 'int32', 'float32']).columns.tolist()
        
        # If no numeric columns found, try to detect numeric columns by attempting conversion
        # But exclude columns that are clearly text (object/string type)
        if not numeric_columns:
            text_type_columns = df.select_dtypes(include=['object', 'string']).columns.tolist()
            for col in df.columns:
                if col not in text_type_columns:  # Skip text columns
                    try:
                        # Try to convert to numeric
                        pd.to_numeric(df[col], errors='raise')
                        numeric_columns.append(col)
                    except (ValueError, TypeError):
                        pass
        
        # Get text/category columns for labels (exclude numeric columns)
        text_columns = df.select_dtypes(include=['object', 'string']).columns.tolist()
        # Exclude columns that are numeric
        text_columns = [col for col in text_columns if col not in numeric_columns]
        label_column = text_columns[0] if text_columns else None
        
        # Save document to database for user
        try:
            from psycopg2.extras import RealDictCursor
            cursor = db.cursor(cursor_factory=RealDictCursor)
            
            try:
                # Store file content as JSON in database
                import json
                document_data = {
                    "filename": file.filename,
                    "columns": columns,
                    "numeric_columns": numeric_columns,
                    "text_columns": text_columns,
                    "label_column": label_column,
                    "row_count": len(df),
                    "data": records,  # Store all data (cleaned)
                    "full_data_count": len(df)
                }
                
                # Clean document_data before JSON serialization
                document_data = clean_for_json(document_data)
                
                # Check if user already has a saved document
                cursor.execute("""
                    SELECT id FROM analytics_documents 
                    WHERE user_id = %s
                """, (current_user["id"],))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing document
                    cursor.execute("""
                        UPDATE analytics_documents 
                        SET filename = %s, document_data = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = %s
                    """, (file.filename, json.dumps(document_data), current_user["id"]))
                else:
                    # Insert new document
                    cursor.execute("""
                        INSERT INTO analytics_documents (user_id, filename, document_data)
                        VALUES (%s, %s, %s)
                    """, (current_user["id"], file.filename, json.dumps(document_data)))
                
                db.commit()
            except Exception as save_error:
                # Log error but don't fail the upload
                print(f"Error saving document to database: {str(save_error)}")
                db.rollback()
            finally:
                cursor.close()
        except Exception as save_error:
            # Log error but don't fail the upload
            print(f"Error with database connection: {str(save_error)}")
            pass
        
        return {
            "success": True,
            "filename": file.filename,
            "columns": columns,
            "numeric_columns": numeric_columns,
            "text_columns": text_columns,
            "label_column": label_column,
            "row_count": len(df),
            "data": records[:100],  # Limit to first 100 rows for preview
            "full_data_count": len(df)
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/analytics/saved-document")
async def get_saved_document(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user's saved uploaded document"""
    try:
        from psycopg2.extras import RealDictCursor
        import json
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        try:
            cursor.execute("""
                SELECT filename, document_data, updated_at
                FROM analytics_documents
                WHERE user_id = %s
                ORDER BY updated_at DESC
                LIMIT 1
            """, (current_user["id"],))
            
            result = cursor.fetchone()
            
            if result:
                document_data = json.loads(result["document_data"]) if isinstance(result["document_data"], str) else result["document_data"]
                return {
                    "success": True,
                    "document": document_data
                }
            else:
                return {
                    "success": False,
                    "message": "No saved document found"
                }
        finally:
            cursor.close()
    except Exception as e:
        # If table doesn't exist, return no document
        print(f"Error fetching saved document: {str(e)}")
        return {
            "success": False,
            "message": "No saved document found"
        }