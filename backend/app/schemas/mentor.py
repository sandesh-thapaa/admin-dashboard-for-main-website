from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class MentorBase(BaseModel):
    name: str
    photo_url: Optional[str] = None
    specialization: Optional[str] = None


class MentorCreate(MentorBase):
     name: str
     photo_url: Optional[str] = None


class MentorUpdate(MentorBase):
     name: Optional[str] = None
     photo_url: Optional[str] = None

class MentorResponse(MentorBase):
    id: UUID

    class Config:
        from_attributes = True
