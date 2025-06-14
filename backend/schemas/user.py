from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    confirm_password: str
    organization: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department: Optional[str] = ""
    phone: Optional[str] = ""
    avatarUrl: Optional[str] = ""
    jobTitle: Optional[str] = ""
    bio: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    twitter: Optional[str] = ""
    skills: List[str] = []
    achievements: List[str] = []
    education: List[dict] = []
    experience: List[dict] = []

class UserProfileUpdate(BaseModel):
    role: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    skills: Optional[str] = None
    achievements: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None 