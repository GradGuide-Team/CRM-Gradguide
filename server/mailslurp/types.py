from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class MailSlurpInbox(BaseModel):
    id: str
    email_address: str
    actual_email_address: Optional[str] = None  
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

class MailSlurpEmail(BaseModel):
    id: str
    subject: Optional[str] = None
    from_address: Optional[str] = None
    to: List[str] = []
    cc: List[str] = []
    bcc: List[str] = []
    body: Optional[str] = None
    body_md5_hash: Optional[str] = None
    read: bool = False
    created_at: datetime
    inbox_id: str
    attachment_ids: List[str] = []

class EmailSendOptions(BaseModel):
    to: str
    subject: str
    body: str
    attachments: Optional[List[Dict[str, Any]]] = None

class EmailReplyOptions(BaseModel):
    email_id: str
    body: str
    attachments: Optional[List[Dict[str, Any]]] = None

class EmailAttachment(BaseModel):
    id: str
    name: str
    content_type: str
    content_length: int

class ServiceStatus(BaseModel):
    healthy: bool
    inbox_count: Optional[int] = None
    error: Optional[str] = None
    timestamp: str