from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from backend.database.db import get_db

from backend.auth_utils import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_data(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Helper function to safely execute queries with rollback on error
        def execute_query(query, params=None):
            try:
                cursor = db.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params or ())
                result = cursor.fetchall()
                cursor.close()
                return result
            except Exception as e:
                print(f"Query error: {str(e)}")
                db.rollback()
                return None
        
        def execute_query_one(query, params=None):
            try:
                cursor = db.cursor(cursor_factory=RealDictCursor)
                cursor.execute(query, params or ())
                result = cursor.fetchone()
                cursor.close()
                return result
            except Exception as e:
                print(f"Query error: {str(e)}")
                db.rollback()
                return None
        
        # Get user's organization
        org_result = execute_query_one(
            "SELECT organization_id FROM users WHERE id = %s",
            (current_user["id"],)
        )
        organization_id = org_result.get("organization_id") if org_result else None
        
        # Get document statistics
        doc_result = execute_query_one("""
            SELECT 
                COUNT(*) as total_documents,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_documents,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_documents
            FROM documents 
            LIMIT 1
        """)
        doc_stats = dict(doc_result) if doc_result else {"total_documents": 0, "recent_documents": 0, "monthly_documents": 0}
        
        # Get user statistics
        if organization_id:
            user_result = execute_query_one("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN role = 'employee' THEN 1 END) as employee_users
                FROM users 
                WHERE organization_id = %s
            """, (organization_id,))
        else:
            user_result = execute_query_one("""
                SELECT 
                    1 as total_users,
                    CASE WHEN role = 'admin' THEN 1 ELSE 0 END as admin_users,
                    CASE WHEN role = 'employee' THEN 1 ELSE 0 END as employee_users
                FROM users 
                WHERE id = %s
            """, (current_user["id"],))
        user_stats = dict(user_result) if user_result else {"total_users": 1, "admin_users": 0, "employee_users": 1}
        
        # Get recent activities
        recent_activities_result = execute_query("""
            SELECT a.*, u.name as user_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
            LIMIT 10
        """, (current_user["id"],))
        recent_activities = [dict(row) for row in recent_activities_result] if recent_activities_result else []
        
        # Get document categories distribution
        category_stats_result = execute_query("""
            SELECT 
                c.name as category,
                COUNT(d.id) as document_count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id
            GROUP BY c.id, c.name
            ORDER BY document_count DESC
        """)
        category_stats = [dict(row) for row in category_stats_result] if category_stats_result else []
        
        # Get storage usage
        storage_result = execute_query_one("""
            SELECT 
                COUNT(*) as file_count
            FROM documents 
            LIMIT 1
        """)
        storage_stats = dict(storage_result) if storage_result else {"file_count": 0}
        # Add total_size with default 0
        if storage_stats and "total_size" not in storage_stats:
            storage_stats["total_size"] = 0
        
        # Get recent documents
        recent_documents_result = execute_query("""
            SELECT d.*, c.name as category_name
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            ORDER BY d.created_at DESC
            LIMIT 5
        """)
        recent_documents = [dict(row) for row in recent_documents_result] if recent_documents_result else []
        
        # Get system health metrics
        if organization_id:
            system_health_result = execute_query_one("""
                SELECT 
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_contacts
                FROM (
                    SELECT 'open' as status FROM support_tickets WHERE organization_id = %s AND status = 'open'
                    UNION ALL
                    SELECT 'pending' as status FROM contact_submissions WHERE organization_id = %s AND status = 'pending'
                ) combined
            """, (organization_id, organization_id))
        else:
            system_health_result = {"open_tickets": 0, "pending_contacts": 0}
        system_health = dict(system_health_result) if system_health_result else {"open_tickets": 0, "pending_contacts": 0}
        
        # Safely extract values
        def safe_get(obj, key, default=0):
            if not obj:
                return default
            if isinstance(obj, dict):
                return obj.get(key, default)
            try:
                return obj[key] if key in obj else default
            except (TypeError, KeyError):
                return default
        
        return {
            "document_stats": {
                "total": safe_get(doc_stats, "total_documents", 0),
                "recent": safe_get(doc_stats, "recent_documents", 0),
                "monthly": safe_get(doc_stats, "monthly_documents", 0)
            },
            "user_stats": {
                "total": safe_get(user_stats, "total_users", 1),
                "admins": safe_get(user_stats, "admin_users", 0),
                "employees": safe_get(user_stats, "employee_users", 1)
            },
            "storage_stats": {
                "total_size": safe_get(storage_stats, "total_size", 0),
                "file_count": safe_get(storage_stats, "file_count", 0),
                "usage_percentage": min((safe_get(storage_stats, "total_size", 0) / (1024 * 1024 * 1024)) * 100, 100)
            },
            "category_distribution": category_stats if category_stats else [],
            "recent_activities": recent_activities if recent_activities else [],
            "recent_documents": recent_documents if recent_documents else [],
            "system_health": {
                "open_tickets": safe_get(system_health, "open_tickets", 0),
                "pending_contacts": safe_get(system_health, "pending_contacts", 0)
            }
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in get_dashboard_data: {str(e)}")
        print(error_trace)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

@router.get("/dashboard/analytics")
async def get_dashboard_analytics(
    period: str = "7d",
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Get user's organization
        cursor.execute("""
            SELECT organization_id FROM users WHERE id = %s
        """, (current_user["id"],))
        
        org_result = cursor.fetchone()
        if not org_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User organization not found"
            )
        
        organization_id = org_result["organization_id"]
        
        # Determine date range based on period
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:
            days = 7
        
        # Get daily document uploads
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as uploads
            FROM documents 
            WHERE organization_id = %s 
            AND created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (organization_id, days))
        
        document_trends = cursor.fetchall()
        
        # Get daily user activities
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as activities
            FROM activities 
            WHERE user_id IN (
                SELECT id FROM users WHERE organization_id = %s
            )
            AND created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (organization_id, days))
        
        activity_trends = cursor.fetchall()
        
        # Get top categories
        cursor.execute("""
            SELECT 
                c.name as category,
                COUNT(d.id) as document_count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id AND d.organization_id = %s
            GROUP BY c.id, c.name
            ORDER BY document_count DESC
            LIMIT 5
        """, (organization_id,))
        
        top_categories = cursor.fetchall()
        
        # Get user activity by type
        cursor.execute("""
            SELECT 
                type,
                COUNT(*) as count
            FROM activities 
            WHERE user_id IN (
                SELECT id FROM users WHERE organization_id = %s
            )
            AND created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY type
            ORDER BY count DESC
        """, (organization_id, days))
        
        activity_by_type = cursor.fetchall()
        
        return {
            "period": period,
            "document_trends": document_trends,
            "activity_trends": activity_trends,
            "top_categories": top_categories,
            "activity_by_type": activity_by_type
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/quick-actions")
async def get_quick_actions(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Get user's organization
        cursor.execute("""
            SELECT organization_id FROM users WHERE id = %s
        """, (current_user["id"],))
        
        org_result = cursor.fetchone()
        if not org_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User organization not found"
            )
        
        organization_id = org_result["organization_id"]
        
        # Get pending items for quick actions
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_contacts,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets
            FROM (
                SELECT status FROM contact_submissions WHERE organization_id = %s
                UNION ALL
                SELECT status FROM support_tickets WHERE organization_id = %s
            ) combined
        """, (organization_id, organization_id))
        
        pending_items = cursor.fetchone()
        
        # Get recent uploads by user
        cursor.execute("""
            SELECT COUNT(*) as recent_uploads
            FROM documents 
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        """)
        
        user_uploads = cursor.fetchone()
        
        return {
            "pending_contacts": pending_items["pending_contacts"] if pending_items else 0,
            "open_tickets": pending_items["open_tickets"] if pending_items else 0,
            "recent_uploads": user_uploads["recent_uploads"] if user_uploads else 0,
            "can_upload": True,  # Always allow uploads
            "can_manage_users": current_user["role"] == "admin",
            "can_view_analytics": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 