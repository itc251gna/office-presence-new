from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class Attendance(BaseModel):
    attendance_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    date: str  # Format: YYYY-MM-DD
    status: str  # present, remote, absent
    notes: Optional[str] = None
    created_at: datetime

class AttendanceCreate(BaseModel):
    date: str
    status: str
    notes: Optional[str] = None

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# Auth helper function
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    # Check cookie first, then Authorization header
    token = session_token
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Parse datetime if string
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# Auth endpoints
@api_router.post("/auth/callback")
async def auth_callback(request: Request, response: Response):
    body = await request.json()
    session_id = body.get('session_id')
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            auth_response.raise_for_status()
            auth_data = auth_response.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Auth failed: {str(e)}")
    
    # Extract user data
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    email = auth_data['email']
    name = auth_data['name']
    picture = auth_data.get('picture')
    session_token = auth_data['session_token']
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        user_id = existing_user['user_id']
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    # Get user data
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user}

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# Users endpoint
@api_router.get("/users", response_model=List[User])
async def get_users(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_current_user(request, session_token)  # Verify auth
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    # Parse datetime strings
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

# Attendances endpoints
@api_router.get("/attendances", response_model=List[Attendance])
async def get_attendances(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    year: Optional[int] = None,
    month: Optional[int] = None
):
    await get_current_user(request, session_token)  # Verify auth
    
    # Build query
    query = {}
    if year and month:
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year+1}-01-01"
        else:
            end_date = f"{year}-{month+1:02d}-01"
        query["date"] = {"$gte": start_date, "$lt": end_date}
    
    attendances = await db.attendances.find(query, {"_id": 0}).to_list(10000)
    
    # Parse datetime strings
    for att in attendances:
        if isinstance(att['created_at'], str):
            att['created_at'] = datetime.fromisoformat(att['created_at'])
    
    return attendances

@api_router.post("/attendances", response_model=Attendance)
async def create_attendance(
    input: AttendanceCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    user = await get_current_user(request, session_token)
    
    # Check if attendance already exists for this user and date
    existing = await db.attendances.find_one({
        "user_id": user.user_id,
        "date": input.date
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already exists for this date")
    
    attendance_id = f"att_{uuid.uuid4().hex[:12]}"
    attendance_doc = {
        "attendance_id": attendance_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_picture": user.picture,
        "date": input.date,
        "status": input.status,
        "notes": input.notes,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.attendances.insert_one(attendance_doc)
    attendance_doc.pop('_id', None)
    return Attendance(**attendance_doc)

@api_router.put("/attendances/{attendance_id}", response_model=Attendance)
async def update_attendance(
    attendance_id: str,
    input: AttendanceUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    user = await get_current_user(request, session_token)
    
    # Find attendance
    attendance = await db.attendances.find_one({
        "attendance_id": attendance_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    # Update fields
    update_data = {}
    if input.status:
        update_data["status"] = input.status
    if input.notes is not None:
        update_data["notes"] = input.notes
    
    if update_data:
        await db.attendances.update_one(
            {"attendance_id": attendance_id},
            {"$set": update_data}
        )
    
    # Get updated attendance
    updated = await db.attendances.find_one({"attendance_id": attendance_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Attendance(**updated)

@api_router.delete("/attendances/{attendance_id}")
async def delete_attendance(
    attendance_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    user = await get_current_user(request, session_token)
    
    result = await db.attendances.delete_one({
        "attendance_id": attendance_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    return {"message": "Attendance deleted"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()