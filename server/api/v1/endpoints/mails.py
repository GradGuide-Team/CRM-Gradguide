import httpx  # Add this import
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from typing import Optional
from server.mailslurp.mailslurp_service import mailslurp_service

class StudentCreateRequest(BaseModel):
    name: str
    birthdate: str
    email_address: str

class StudentResponse(BaseModel):
    id: str
    name: str
    email_address: str
    mailslurp_inbox_id: Optional[str] = None
    mailslurp_email: Optional[str] = None

router = APIRouter()

@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student_data: StudentCreateRequest):
    """Create a new student with MailSlurp inbox"""
    try:
        if not student_data.name or not student_data.birthdate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid student data: name and birthdate are required"
            )

        # Create a temporary email inbox for this student
        inbox = await mailslurp_service.create_inbox(
            student_name=student_data.name, 
            birthdate=student_data.birthdate
        )
        
        return StudentResponse(
            id="mock_student_id",
            name=student_data.name,
            email_address=student_data.email_address,
            mailslurp_inbox_id=inbox.id,
            mailslurp_email=inbox.email_address
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create student: {str(e)}"
        )

@router.get("/verify-domain")
async def verify_domain():
    """Verify if the custom domain is properly configured"""
    try:
        domain_verified = await mailslurp_service.inbox_manager.verify_domain_configuration()
        
        return {
            "domain_verified": domain_verified,
            "custom_domain": "student-portal.in",
            "domain_id": "a71ef356-4ac8-4767-afcc-b607cc7ebe67"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Domain verification failed: {str(e)}"
        )

@router.get("/debug-domains")
async def debug_domains():
    """Debug: List all available domains"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mailslurp.com/domains",
                headers={"x-api-key": mailslurp_service.api_key}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list domains: {str(e)}"
        )

# Update your server/api/v1/endpoints/mails.py list-inboxes endpoint:

@router.get("/list-inboxes")
async def list_inboxes():
    """Debug: List all inboxes to see what's being created"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mailslurp.com/inboxes",
                headers={"x-api-key": mailslurp_service.api_key},
                params={"size": 10}  # Remove the sort parameter for now
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list inboxes: {str(e)}"
        )

@router.get("/account-info")
async def get_account_info():
    """Get MailSlurp account information and limits"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mailslurp.com/account",
                headers={"x-api-key": mailslurp_service.api_key}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account info: {str(e)}"
        )