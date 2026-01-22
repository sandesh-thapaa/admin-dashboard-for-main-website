from uuid import UUID # To handle unique IDs
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.opportunities.opportunity import Opportunity
from app.models.opportunities.job import JobDetail
from app.models.opportunities.internship import InternshipDetail
from app.models.opportunities.requirement import OpportunityRequirement
from app.models.opportunities.enums import OpportunityType
from app.schemas.opportunities import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
)
from app.auth.deps import get_current_user # To check if the user is logged in

# Setup the router for all job and internship links
router = APIRouter(
    prefix="/api/admin/opportunities",
    tags=["Admin Opportunities"],
)

# Helper function to format the data for the frontend
def opportunity_response(
    opportunity_obj: Opportunity,
    db: Session,
) -> OpportunityResponse:
    # Step 1: Get all requirements for this opportunity from the database
    requirements = (
        db.query(OpportunityRequirement)
        .filter_by(opportunity_id=opportunity_obj.id)
        .order_by(OpportunityRequirement.order)
        .all()
    )

    job_details = None
    internship_details = None

    # Step 2: If it's a JOB, find its extra details (like salary)
    if opportunity_obj.type == OpportunityType.JOB:
        job = db.query(JobDetail).filter_by(
            opportunity_id=opportunity_obj.id
        ).first()
        if job:
            job_details = {
                "employment_type": job.employment_type,
                "salary_range": job.salary_range,
            }

    # Step 3: If it's an INTERNSHIP, find its extra details (like duration)
    if opportunity_obj.type == OpportunityType.INTERNSHIP:
        internship = db.query(InternshipDetail).filter_by(
            opportunity_id=opportunity_obj.id
        ).first()
        if internship:
            internship_details = {
                "duration_months": internship.duration_months,
                "stipend": internship.stipend,
            }

    return OpportunityResponse(
        id=str(opportunity_obj.id),
        title=opportunity_obj.title,
        description=opportunity_obj.description,
        location=opportunity_obj.location,
        type=opportunity_obj.type,
        job_details=job_details,
        internship_details=internship_details,
        created_at=opportunity_obj.created_at,
        requirements=[r.text for r in requirements],
    )


@router.post(
    "",
    response_model=OpportunityResponse,
    status_code=status.HTTP_201_CREATED,
)
# 1. Create a new Job or Internship
def create_opportunity(
    payload: OpportunityCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user),
):
    # Step 1: Create the main opportunity record
    new_opportunity = Opportunity(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        type=payload.type,
    )
    db.add(new_opportunity)
    db.flush()  # This generates the ID so we can use it for the details below

    # Step 2: Save the extra details based on the type (Job or Internship)
    if payload.type == OpportunityType.JOB:
        db.add(
            JobDetail(
                opportunity_id=new_opportunity.id,
                employment_type=payload.job_details.employment_type,
                salary_range=payload.job_details.salary_range,
            )
        )

    elif payload.type == OpportunityType.INTERNSHIP:
        db.add(
            InternshipDetail(
                opportunity_id=new_opportunity.id,
                duration_months=payload.internship_details.duration_months,
                stipend=payload.internship_details.stipend,
            )
        )

    # Step 3: Save all the requirement lines one by one
    for idx, text in enumerate(payload.requirements):
        db.add(
            OpportunityRequirement(
                opportunity_id=new_opportunity.id,
                text=text,
                order=idx,
            )
        )

    db.commit()
    db.refresh(new_opportunity)

    return opportunity_response(new_opportunity, db)


@router.get(
    "",
    response_model=list[OpportunityResponse],
)
# 2. Get a list of all opportunities (with search and filters)
def list_opportunities(
    type: OpportunityType | None = None,
    location: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    
):
    # Step 1: Start with a basic query
    query = db.query(Opportunity)

    # Step 2: Add filters if the user provided them in the URL
    if type is not None:
        query = query.filter(Opportunity.type == type)

    if location:
        query = query.filter(
            Opportunity.location.ilike(f"%{location}%") # ilike means "search case-insensitive"
        )

    if search:
        query = query.filter(
            Opportunity.title.ilike(f"%{search}%")
        )

    # Step 3: Get the final list, newest first
    opportunities = query.order_by(
        Opportunity.created_at.desc()
    ).all()

    return [
        opportunity_response(op, db)
        for op in opportunities
    ]


@router.get(
    "/{opportunity_id}",
    response_model=OpportunityResponse,
)
# 3. Get details of one specific opportunity
def get_opportunity(
    opportunity_id: UUID,
    db: Session = Depends(get_db),
):
    opportunity_obj = db.get(Opportunity, opportunity_id)
    if not opportunity_obj:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return opportunity_response(opportunity_obj, db)


@router.patch(
    "/{opportunity_id}",
    response_model=OpportunityResponse,
)
# 4. Update an existing opportunity
def update_opportunity(
    opportunity_id: UUID,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    opportunity_obj = db.get(Opportunity, opportunity_id)
    if not opportunity_obj:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Step 1: Update the basic fields (title, description, etc.)
    for field in ("title", "description", "location"):
        value = getattr(payload, field)
        if value is not None:
            setattr(opportunity_obj, field, value)

    # Step 2: Update the extra details (Job or Internship)
    if opportunity_obj.type == OpportunityType.JOB and payload.job_details:
        job = db.query(JobDetail).filter_by(
            opportunity_id=opportunity_obj.id
        ).first()
        if job:
            job.employment_type = payload.job_details.employment_type
            job.salary_range = payload.job_details.salary_range

    if opportunity_obj.type == OpportunityType.INTERNSHIP and payload.internship_details:
        internship = db.query(InternshipDetail).filter_by(
            opportunity_id=opportunity_obj.id
        ).first()
        if internship:
            internship.duration_months = payload.internship_details.duration_months
            internship.stipend = payload.internship_details.stipend

    # Step 3: Update requirements (we delete the old ones and add the new ones)
    if payload.requirements is not None:
        db.query(OpportunityRequirement).filter_by(
            opportunity_id=opportunity_obj.id
        ).delete()

        for idx, text in enumerate(payload.requirements):
            db.add(
                OpportunityRequirement(
                    opportunity_id=opportunity_obj.id,
                    text=text,
                    order=idx,
                )
            )

    db.commit()
    db.refresh(opportunity_obj)
    return opportunity_response(opportunity_obj, db)


@router.delete(
    "/{opportunity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
# 5. Delete an opportunity
def delete_opportunity(
    opportunity_id: UUID,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    
    opportunity_obj = db.get(Opportunity, opportunity_id)
    if not opportunity_obj:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.delete(opportunity_obj)
    db.commit()
