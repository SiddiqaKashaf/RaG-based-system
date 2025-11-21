from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr
import bcrypt
import jwt
from datetime import datetime, timedelta
from backend.database.db import get_db

from backend.config import settings


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

class LoginModel(BaseModel):
    email: EmailStr
    password: str

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/login")
async def login_endpoint(
    login_data: LoginModel,
    db: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        print("\n=== Login Attempt ===")
        print(f"Email: {login_data.email}")
        cursor = db.cursor()
        
        # Get user from database
        cursor.execute("SELECT * FROM users WHERE email = %s", (login_data.email,))
        user = cursor.fetchone()
        
        if not user:
            print("User not found in database")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print("User found in database")
        print(f"User ID: {user['id']}")
        print(f"Stored password type: {type(user['password'])}")
        
        # Verify password
        try:
            print("Attempting password verification...")
            # Convert stored password to bytes if it's a string
            stored_password = user["password"]
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            # Convert input password to bytes
            input_password = login_data.password.encode('utf-8')
            
            # Verify password
            is_valid = bcrypt.checkpw(input_password, stored_password)
            print(f"Password verification result: {is_valid}")
            
            if not is_valid:
                print("Password verification failed")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except Exception as e:
            print(f"Password verification error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error verifying password"
            )
        
        print("Password verified successfully")
        
        # Create access token
        try:
            access_token = create_access_token(
                data={
                    "sub": str(user["id"]),
                    "role": user["role"]  # Include role in token
                },
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            print("Access token created successfully")
        except Exception as e:
            print(f"Token creation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating access token"
            )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "organization_id": user.get("organization_id")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print("\n=== Login Error ===")
        print(f"Error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login: {str(e)}"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt 