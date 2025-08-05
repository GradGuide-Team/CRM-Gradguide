import os
from typing import Optional

class Config:
    MAILSLURP_API_KEY: Optional[str] = "9e25cb078320307d115505290efa9716303480c0f13d985cfd4c89a53bbe2b04"
    MAILSLURP_BASE_URL: str = "https://api.mailslurp.com"

config = Config()