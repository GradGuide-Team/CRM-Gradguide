import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from .config import config
from .inbox_manager import InboxManager
from .email_manager import EmailManager
from .types import (
    MailSlurpInbox, 
    MailSlurpEmail, 
    EmailSendOptions, 
    EmailReplyOptions,
    ServiceStatus
)

class MailSlurpService:
    """Main MailSlurp service that orchestrates all email operations"""
    
    def __init__(self):
        if not config.MAILSLURP_API_KEY:
            raise ValueError("MAILSLURP_API_KEY environment variable is required")
        
        self.api_key = config.MAILSLURP_API_KEY
        self.base_url = config.MAILSLURP_BASE_URL
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        self.inbox_manager = InboxManager(self.api_key, self.base_url)
        self.email_manager = EmailManager(self.api_key, self.base_url)

    # Inbox operations
    async def create_inbox(self, student_name: Optional[str] = None, birthdate: Optional[str] = None) -> MailSlurpInbox:
        """Create a new inbox for a student with custom domain email"""
        return await self.inbox_manager.create_inbox(student_name, birthdate)

    async def delete_inbox(self, inbox_id: str) -> None:
        """Delete an inbox"""
        return await self.inbox_manager.delete_inbox(inbox_id)

    async def get_inbox(self, inbox_id: str) -> Optional[MailSlurpInbox]:
        """Get inbox details"""
        return await self.inbox_manager.get_inbox(inbox_id)

    # Email operations
    async def get_emails(self, inbox_id: str) -> List[MailSlurpEmail]:
        """Get all emails for an inbox"""
        return await self.email_manager.get_emails(inbox_id)

    async def get_email(self, email_id: str) -> Optional[MailSlurpEmail]:
        """Get a specific email"""
        return await self.email_manager.get_email(email_id)

    async def send_email(self, inbox_id: str, to: str, subject: str, body: str) -> None:
        """Send a simple email"""
        options = EmailSendOptions(to=to, subject=subject, body=body)
        return await self.email_manager.send_email(inbox_id, options)

    async def send_email_with_attachments(
        self,
        inbox_id: str,
        to: str,
        subject: str,
        body: str,
        attachments: List[Dict[str, Any]]
    ) -> None:
        """Send an email with attachments"""
        options = EmailSendOptions(to=to, subject=subject, body=body, attachments=attachments)
        return await self.email_manager.send_email(inbox_id, options)

    async def reply_to_email(self, inbox_id: str, email_id: str, body: str) -> None:
        """Reply to an email"""
        options = EmailReplyOptions(email_id=email_id, body=body)
        return await self.email_manager.reply_to_email(inbox_id, options)

    async def reply_to_email_with_attachments(
        self,
        inbox_id: str,
        email_id: str,
        body: str,
        attachments: List[Dict[str, Any]]
    ) -> None:
        """Reply to an email with attachments"""
        options = EmailReplyOptions(email_id=email_id, body=body, attachments=attachments)
        return await self.email_manager.reply_to_email(inbox_id, options)

    async def forward_email(
        self,
        inbox_id: str,
        to: str,
        subject: str,
        body: str,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """Forward an email"""
        return await self.email_manager.forward_email(inbox_id, to, subject, body, attachments)

    async def delete_email(self, email_id: str) -> None:
        """Delete a single email"""
        return await self.email_manager.delete_email(email_id)

    async def delete_emails(self, email_ids: List[str]) -> None:
        """Delete multiple emails"""
        return await self.email_manager.delete_emails(email_ids)

    # Attachment operations
    async def download_attachment(self, attachment_id: str, email_id: str) -> bytes:
        """Download an email attachment"""
        return await self.email_manager.download_attachment(attachment_id, email_id)

    # Health check and service status
    async def health_check(self) -> bool:
        """Check if the MailSlurp service is healthy"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/inboxes",
                    headers=self.headers,
                    params={"size": 1}  # Only get 1 inbox for health check
                )
                response.raise_for_status()
                return True
        except Exception as e:
            print(f"MailSlurp health check failed: {e}")
            return False

    async def get_service_status(self) -> ServiceStatus:
        """Get service status and statistics"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/inboxes",
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                return ServiceStatus(
                    healthy=True,
                    inbox_count=data.get("totalElements", 0),
                    timestamp=datetime.now().isoformat()
                )
        except Exception as e:
            return ServiceStatus(
                healthy=False,
                error=str(e),
                timestamp=datetime.now().isoformat()
            )

# Export singleton instance
mailslurp_service = MailSlurpService()

