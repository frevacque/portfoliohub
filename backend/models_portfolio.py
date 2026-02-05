from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Portfolio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_default: bool = False
