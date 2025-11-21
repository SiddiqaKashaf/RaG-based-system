from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr
from backend.database.db import get_db

from backend.auth_utils import get_current_user

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    priority: Optional[str] = "normal"

class SupportTicket(BaseModel):
    title: str
    description: str
    category: str
    priority: Optional[str] = "medium"

@router.post("/contact")
async def submit_contact_form(
    contact: ContactForm,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Insert contact form submission
        cursor.execute("""
            INSERT INTO contact_submissions (
                name, email, subject, message, priority, 
                user_id, organization_id, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            contact.name,
            contact.email,
            contact.subject,
            contact.message,
            contact.priority,
            current_user["id"],
            current_user["organization_id"],
            "pending"
        ))
        
        submission_id = cursor.fetchone()["id"]
        db.commit()
        
        # Log activity
        cursor.execute("""
            INSERT INTO activities (type, user_id, action, target)
            VALUES (%s, %s, %s, %s)
        """, ("contact", current_user["id"], "submitted", contact.subject))
        db.commit()
        
        return {
            "message": "Contact form submitted successfully",
            "submission_id": submission_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/support/ticket")
async def create_support_ticket(
    ticket: SupportTicket,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Insert support ticket
        cursor.execute("""
            INSERT INTO support_tickets (
                title, description, category, priority,
                user_id, organization_id, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            ticket.title,
            ticket.description,
            ticket.category,
            ticket.priority,
            current_user["id"],
            current_user["organization_id"],
            "open"
        ))
        
        ticket_id = cursor.fetchone()["id"]
        db.commit()
        
        # Log activity
        cursor.execute("""
            INSERT INTO activities (type, user_id, action, target)
            VALUES (%s, %s, %s, %s)
        """, ("support", current_user["id"], "created", ticket.title))
        db.commit()
        
        return {
            "message": "Support ticket created successfully",
            "ticket_id": ticket_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/contact/submissions")
async def get_contact_submissions(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        # Check if user is admin
        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can view contact submissions"
            )
        
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT cs.*, u.name as user_name
            FROM contact_submissions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.organization_id = %s
            ORDER BY cs.created_at DESC
        """, (current_user["organization_id"],))
        
        submissions = cursor.fetchall()
        return submissions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/support/tickets")
async def get_support_tickets(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # If admin, get all tickets for organization
        if current_user["role"] == "admin":
            cursor.execute("""
                SELECT st.*, u.name as user_name
                FROM support_tickets st
                JOIN users u ON st.user_id = u.id
                WHERE st.organization_id = %s
                ORDER BY st.created_at DESC
            """, (current_user["organization_id"],))
        else:
            # Regular users see only their tickets
            cursor.execute("""
                SELECT st.*, u.name as user_name
                FROM support_tickets st
                JOIN users u ON st.user_id = u.id
                WHERE st.user_id = %s
                ORDER BY st.created_at DESC
            """, (current_user["id"],))
        
        tickets = cursor.fetchall()
        return tickets
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/support/tickets/{ticket_id}")
async def update_support_ticket(
    ticket_id: int,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    response: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        cursor = db.cursor()
        
        # Check if ticket exists and user has access
        if current_user["role"] == "admin":
            cursor.execute("""
                SELECT id FROM support_tickets 
                WHERE id = %s AND organization_id = %s
            """, (ticket_id, current_user["organization_id"]))
        else:
            cursor.execute("""
                SELECT id FROM support_tickets 
                WHERE id = %s AND user_id = %s
            """, (ticket_id, current_user["id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Support ticket not found"
            )
        
        # Build update query
        update_fields = []
        values = []
        
        if status is not None:
            update_fields.append("status = %s")
            values.append(status)
        
        if priority is not None:
            update_fields.append("priority = %s")
            values.append(priority)
        
        if response is not None:
            update_fields.append("response = %s")
            values.append(response)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        values.append(ticket_id)
        
        query = f"""
            UPDATE support_tickets 
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, status, priority, response, updated_at
        """
        
        cursor.execute(query, values)
        updated_ticket = cursor.fetchone()
        db.commit()
        
        return updated_ticket
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 