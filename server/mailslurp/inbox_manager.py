import httpx
from typing import Optional, List
from datetime import datetime
import re
import math
import random
from .types import MailSlurpInbox

class InboxManager:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json"
        }
        # Custom domain configuration (like your Node.js version)
        self.custom_domain = 'student-portal.in'
        self.domain_id = 'a71ef356-4ac8-4767-afcc-b607cc7ebe67'  # student-portal.in domain ID

    async def verify_domain_configuration(self) -> bool:
        """Verify that the custom domain is properly configured"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/domains/{self.domain_id}",
                    headers=self.headers
                )
                
                print(f"🔍 Domain verification status: {response.status_code}")
                print(f"🔍 Domain verification response: {response.text}")
                
                if response.status_code == 200:
                    domain_info = response.json()
                    print(f"✅ Domain configuration verified: {domain_info.get('domain', 'unknown')}")
                    print(f"🔍 Domain details: {domain_info}")
                    return True
                else:
                    print(f"❌ Domain verification failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Domain verification error: {e}")
            return False

    def _generate_email_from_name(self, student_name: str) -> str:
        """Generate a realistic email address from student name (Python version of your Node.js function)"""
        clean_name = re.sub(r'[^a-z\s]', '', student_name.lower()).strip()
        name_parts = clean_name.split()
        
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = name_parts[-1]
            
            # Try different combinations for variety
            variations = [
                f"{first_name}.{last_name}",
                f"{first_name}{last_name[0]}",
                f"{first_name[0]}{last_name}",
                f"{first_name}_{last_name}",
                f"{first_name}{last_name}",  # Full name without separator
                f"{first_name[0]}{last_name[0]}{last_name[1:]}"  # dkumar style
            ]
            
            # Use a simple hash to pick variation consistently for same name
            hash_val = sum(ord(char) for char in student_name)
            return variations[hash_val % len(variations)]
        else:
            # Single name - add numbers
            return f"{clean_name}{random.randint(1, 99)}"

    def _generate_birthdate_email_combos(self, email_prefix: str, birthdate: str) -> List[str]:
        """Generate birthdate-based email combinations (Python version of your Node.js function)"""
        # Handle different date formats: DD/MM/YYYY, YYYY-MM-DD, MM/DD/YYYY
        day, month, year = None, None, None
        
        # Try DD/MM/YYYY format first
        match = re.match(r'(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})', birthdate)
        if match:
            day, month, year = match.groups()
        else:
            # Try YYYY-MM-DD format
            match = re.match(r'(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})', birthdate)
            if match:
                year, month, day = match.groups()
            else:
                # Try MM/DD/YYYY format
                match = re.match(r'(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})', birthdate)
                if match:
                    month, day, year = match.groups()
                else:
                    return []  # No valid date format found
        
        # Pad single digits with leading zeros
        day = day.zfill(2)
        month = month.zfill(2)
        year2 = year[-2:]
        
        return [
            f"{email_prefix}{day}{year2}",      # daksh0015
            f"{email_prefix}{month}{year2}",    # daksh0803
            f"{email_prefix}{day}{month}",      # daksh1508
            f"{email_prefix}{month}{day}",      # daksh0815
            f"{email_prefix}{year2}{day}",      # daksh0315
            f"{email_prefix}{year2}{month}",    # daksh0308
            f"{email_prefix}{day}{month}{year2}", # daksh150803
            f"{email_prefix}{month}{day}{year2}", # daksh081503
            f"{email_prefix}{year2}{month}{day}", # daksh030815
            f"{email_prefix}{year2}{day}{month}", # daksh031508
        ]

    def _generate_random_email_prefix(self) -> str:
        """Create a random email prefix"""
        return f"user{random.randint(1, 99999)}"

    async def create_inbox(self, student_name: Optional[str] = None, birthdate: Optional[str] = None) -> MailSlurpInbox:
        """Create a new inbox with intelligent email generation (like your Node.js version)"""
        try:
            email_prefix = ''
            if student_name:
                email_prefix = self._generate_email_from_name(student_name)

            if student_name and email_prefix:
                inbox = await self._try_create_custom_email(email_prefix, birthdate)
            else:
                inbox = await self._create_random_inbox()

            display_email = inbox["emailAddress"]
            
            # Check if we successfully created a custom domain email
            if "@student-portal.in" in display_email:
                print(f"✅ Successfully created custom domain email: {display_email}")
            else:
                print(f"⚠️  Fallback to default MailSlurp email: {display_email}")
            
            return MailSlurpInbox(
                id=inbox["id"],
                email_address=display_email,
                actual_email_address=inbox["emailAddress"]
            )
        except Exception as error:
            print(f"Failed to create MailSlurp inbox: {error}")
            raise Exception("Failed to create temporary email address")

    async def _try_create_custom_email(self, email_prefix: str, birthdate: Optional[str] = None):
        """Try to create inbox with custom email patterns"""
        # First try: simple custom email using correct MailSlurp API approach
        try:
            custom_email = f"{email_prefix}@{self.custom_domain}"
            print(f"🔧 Attempting to create custom email: {custom_email}")
            
            # Use the standard inbox creation endpoint with proper parameters
            # Based on MailSlurp docs, we need to pass emailAddress as a parameter
            payload = {
                "emailAddress": custom_email,
                "domainId": self.domain_id
            }
            
            print(f"📤 Request payload: {payload}")
            print(f"📍 Using standard endpoint: {self.base_url}/inboxes")
            
            async with httpx.AsyncClient() as client:
                # Use the standard /inboxes endpoint (not domain-specific)
                response = await client.post(
                    f"{self.base_url}/inboxes",
                    headers=self.headers,
                    json=payload
                )
                
                print(f"📥 Response status: {response.status_code}")
                print(f"📥 Response body: {response.text}")
                
                if response.status_code == 201:
                    result = response.json()
                    actual_email = result.get("emailAddress", "unknown")
                    actual_domain_id = result.get("domainId", "none")
                    
                    print(f"📧 Expected email: {custom_email}")
                    print(f"📧 Actual email: {actual_email}")
                    print(f"📧 Domain ID in response: {actual_domain_id}")
                    
                    # Check if we actually got the custom domain email
                    if custom_email.lower() == actual_email.lower():
                        print(f"✅ Successfully created custom email: {custom_email}")
                        return result
                    else:
                        print(f"❌ MailSlurp ignored custom email request. Got: {actual_email}")
                        # Try without domainId parameter
                        return await self._try_without_domain_id(custom_email)
                else:
                    print(f"❌ Standard endpoint failed with status {response.status_code}")
                    print(f"❌ Error details: {response.text}")
                    # Try without domainId parameter
                    return await self._try_without_domain_id(custom_email)
                    
        except Exception as custom_error:
            print(f"🔧 Exception in standard creation: {str(custom_error)}")
            print(f"🔧 Custom email creation failed, trying birthdate combinations")
            
            # Second try: birthdate-based combinations
            if birthdate:
                inbox = await self._try_birthdate_combinations(email_prefix, birthdate)
                if inbox:
                    return inbox

            # Final fallback: random number
            return await self._create_random_email_with_prefix(email_prefix)

    async def _try_without_domain_id(self, custom_email: str):
        """Try creating inbox without domainId parameter"""
        try:
            print(f"🔄 Trying without domainId for: {custom_email}")
            
            # Just pass the email address without domainId
            payload = {
                "emailAddress": custom_email
            }
            
            print(f"📤 Simplified payload: {payload}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/inboxes",
                    headers=self.headers,
                    json=payload
                )
                
                print(f"📥 Simplified response status: {response.status_code}")
                print(f"📥 Simplified response body: {response.text}")
                
                if response.status_code == 201:
                    result = response.json()
                    actual_email = result.get("emailAddress", "unknown")
                    
                    if custom_email.lower() == actual_email.lower():
                        print(f"✅ Simplified method worked: {custom_email}")
                        return result
                    else:
                        print(f"❌ Even simplified method ignored custom email: {actual_email}")
                        raise Exception("Simplified method failed - email ignored")
                else:
                    print(f"❌ Simplified method failed with status: {response.status_code}")
                    raise Exception(f"Simplified method failed: {response.status_code}")
                    
        except Exception as simple_error:
            print(f"❌ Simplified method failed: {simple_error}")
            raise Exception("All custom email creation methods failed")



    async def _try_birthdate_combinations(self, email_prefix: str, birthdate: str):
        """Try birthdate-based email combinations"""
        combos = self._generate_birthdate_email_combos(email_prefix, birthdate)
        tried = []
        
        print(f"🎂 Trying {len(combos)} birthdate combinations for {email_prefix}")

        for combo in combos:
            try:
                fallback_email = f"{combo}@{self.custom_domain}"
                payload = {
                    "emailAddress": fallback_email,
                    "domainId": self.domain_id
                }
                
                print(f"🔄 Trying birthdate combo: {fallback_email}")
                
                async with httpx.AsyncClient() as client:
                    # Use standard endpoint, not domain-specific
                    response = await client.post(
                        f"{self.base_url}/inboxes",
                        headers=self.headers,
                        json=payload
                    )
                    
                    print(f"📥 Combo response status: {response.status_code}")
                    
                    if response.status_code == 201:
                        result = response.json()
                        actual_email = result.get("emailAddress", "unknown")
                        
                        if fallback_email.lower() == actual_email.lower():
                            print(f"✅ Successfully created birthdate-based email: {fallback_email}")
                            return result
                        else:
                            print(f"❌ Birthdate combo ignored by MailSlurp: {actual_email}")
                            # Try without domainId for this combo
                            simplified_result = await self._try_combo_without_domain_id(fallback_email)
                            if simplified_result:
                                return simplified_result
                            tried.append(fallback_email)
                            continue
                    else:
                        print(f"❌ Combo failed with status {response.status_code}: {response.text}")
                        tried.append(fallback_email)
                        continue
                        
            except Exception as combo_error:
                print(f"❌ Exception for combo {combo}: {str(combo_error)}")
                tried.append(f"{combo}@{self.custom_domain}")
                continue

        print(f"❌ All birthdate combinations failed: {tried}")
        return None

    async def _try_combo_without_domain_id(self, combo_email: str):
        """Try creating a combo email without domainId"""
        try:
            payload = {"emailAddress": combo_email}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/inboxes",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code == 201:
                    result = response.json()
                    actual_email = result.get("emailAddress", "unknown")
                    
                    if combo_email.lower() == actual_email.lower():
                        print(f"✅ Combo without domainId worked: {combo_email}")
                        return result
                        
            return None
        except Exception:
            return None

    async def _create_random_email_with_prefix(self, email_prefix: str):
        """Create random email with prefix"""
        fallback_email = f"{email_prefix}{random.randint(1, 9999)}@{self.custom_domain}"
        payload = {
            "emailAddress": fallback_email,
            "domainId": self.domain_id,
            "name": f"Student inbox for {email_prefix}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/inboxes",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 201:
                print(f"🎲 Created random fallback email: {fallback_email}")
                return response.json()
            else:
                print(f"❌ Random fallback failed, creating default inbox")
                # If custom domain fails completely, create default inbox
                return await self._create_default_inbox()

    async def _create_random_inbox(self):
        """Create completely random inbox"""
        random_prefix = self._generate_random_email_prefix()
        random_email = f"{random_prefix}@{self.custom_domain}"
        print(f"🎲 Creating random inbox: {random_email}")
        
        payload = {
            "emailAddress": random_email,
            "domainId": self.domain_id,
            "name": f"Student inbox for {random_prefix}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/inboxes",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                print(f"❌ Random inbox creation failed, creating default inbox")
                return await self._create_default_inbox()

    async def _create_default_inbox(self):
        """Create default MailSlurp inbox when custom domain fails"""
        print("🔧 Creating default MailSlurp inbox as fallback")
        payload = {
            "name": "Student inbox"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/inboxes",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def delete_inbox(self, inbox_id: str) -> None:
        """Delete an inbox"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/inboxes/{inbox_id}",
                headers=self.headers
            )
            response.raise_for_status()

    async def get_inbox(self, inbox_id: str) -> Optional[MailSlurpInbox]:
        """Get inbox details"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/inboxes/{inbox_id}",
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                return MailSlurpInbox(
                    id=data["id"],
                    email_address=data["emailAddress"],
                    actual_email_address=data["emailAddress"]
                )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise