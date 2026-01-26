import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Mentor(Base):
    """
    Represents a mentor.
    Stored separately because mentors can appear in multiple trainings.
    """

    __tablename__ = "mentors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    # Mentor name is mandatory

    photo_url = Column(String)
    # Profile image

    specialization = Column(String, nullable=True)
    # E.g. "Python", "Frontend", "Fullstack"

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
