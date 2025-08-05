import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime
import base64
from server.mailslurp.types import MailSlurpEmail, EmailSendOptions, EmailReplyOptions

class EmailManager:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json"
        }

    async def get_emails(self, inbox_id: str) -> List[MailSlurpEmail]:
        """Get all emails for an inbox"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/inboxes/{inbox_id}/emails",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            
            emails = []
            for email_data in data.get("content", []):
                emails.append(self._parse_email(email_data))
            
            return emails

    async def get_email(self, email_id: str) -> Optional[MailSlurpEmail]:
        """Get a specific email"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/emails/{email_id}",
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_email(data)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise

    async def send_email(self, inbox_id: str, options: EmailSendOptions) -> None:
        """Send an email from an inbox"""
        payload = {
            "to": [options.to],
            "subject": options.subject,
            "body": options.body
        }
        
        # Handle attachments if provided
        if options.attachments:
            payload["attachments"] = []
            for attachment in options.attachments:
                # Convert buffer to base64 string
                content_b64 = base64.b64encode(attachment["content"]).decode()
                payload["attachments"].append({
                    "name": attachment["filename"],
                    "contentType": attachment["contentType"],
                    "contentBytes": content_b64
                })
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/inboxes/{inbox_id}/send",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

    async def reply_to_email(self, inbox_id: str, options: EmailReplyOptions) -> None:
        """Reply to an email"""
        payload = {
            "body": options.body
        }
        
        # Handle attachments if provided
        if options.attachments:
            payload["attachments"] = []
            for attachment in options.attachments:
                content_b64 = base64.b64encode(attachment["content"]).decode()
                payload["attachments"].append({
                    "name": attachment["filename"],
                    "contentType": attachment["contentType"],
                    "contentBytes": content_b64
                })
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/inboxes/{inbox_id}/emails/{options.email_id}/reply",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()

    async def forward_email(
        self, 
        inbox_id: str, 
        to: str, 
        subject: str, 
        body: str, 
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """Forward an email"""
        options = EmailSendOptions(to=to, subject=subject, body=body, attachments=attachments)
        await self.send_email(inbox_id, options)

    async def delete_email(self, email_id: str) -> None:
        """Delete a single email"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/emails/{email_id}",
                headers=self.headers
            )
            response.raise_for_status()

    async def delete_emails(self, email_ids: List[str]) -> None:
        """Delete multiple emails"""
        for email_id in email_ids:
            await self.delete_email(email_id)

    async def download_attachment(self, attachment_id: str, email_id: str) -> bytes:
        """Download an email attachment"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/emails/{email_id}/attachments/{attachment_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.content

    def _parse_email(self, email_data: Dict[str, Any]) -> MailSlurpEmail:
        """Parse email data from API response"""
        return MailSlurpEmail(
            id=email_data["id"],
            subject=email_data.get("subject"),
            from_address=email_data.get("from"),
            to=email_data.get("to", []),
            cc=email_data.get("cc", []),
            bcc=email_data.get("bcc", []),
            body=email_data.get("body"),
            body_md5_hash=email_data.get("bodyMD5Hash"),
            read=email_data.get("read", False),
            created_at=datetime.fromisoformat(email_data["createdAt"].replace('Z', '+00:00')),
            inbox_id=email_data["inboxId"],
            attachment_ids=email_data.get("attachments", [])
        )