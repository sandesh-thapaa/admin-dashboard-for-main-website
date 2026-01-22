from typing import List, Optional
from enum import Enum
from datetime import datetime


from pydantic import BaseModel, model_validator


# -------------------------
# Enums
# -------------------------

class OpportunityType(str, Enum):
    JOB = "JOB"
    INTERNSHIP = "INTERNSHIP"


# -------------------------
# Subtype Schemas
# -------------------------

class JobDetails(BaseModel):
    employment_type: Optional[str] = None
    # e.g. Full-time, Part-time, Contract

    salary_range: Optional[str] = None
    # e.g. "60k–80k", "Competitive"


class InternshipDetails(BaseModel):
    duration_months: Optional[int] = None
    # e.g. 3, 6

    stipend: Optional[str] = None
    # e.g. "10k/month", "Unpaid"


# -------------------------
# Create Schema
# -------------------------

class OpportunityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None

    type: OpportunityType

    job_details: Optional[JobDetails] = None
    internship_details: Optional[InternshipDetails] = None

    requirements: List[str]

    @model_validator(mode="after")
    def validate_type_specific_details(self):
        """
        Enforce that exactly the correct subtype payload
        is provided based on opportunity type.
        """
        if self.type == OpportunityType.JOB:
            if not self.job_details:
                raise ValueError("job_details is required when type is JOB")
            if self.internship_details is not None:
                raise ValueError("internship_details is not allowed when type is JOB")

        if self.type == OpportunityType.INTERNSHIP:
            if not self.internship_details:
                raise ValueError(
                    "internship_details is required when type is INTERNSHIP"
                )
            if self.job_details is not None:
                raise ValueError("job_details is not allowed when type is INTERNSHIP")

        return self


# -------------------------
# Update Schema
# -------------------------

class OpportunityUpdate(BaseModel):
    """
    Partial update schema.

    NOTE:
    - type is intentionally NOT updatable here
    - changing type would require semantic migration
    """

    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

    job_details: Optional[JobDetails] = None
    internship_details: Optional[InternshipDetails] = None

    requirements: Optional[List[str]] = None


# -------------------------
# Response Schema
# -------------------------

class OpportunityResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    location: Optional[str]
    created_at: datetime

    type: OpportunityType

    job_details: Optional[JobDetails]
    internship_details: Optional[InternshipDetails]

    requirements: List[str]
