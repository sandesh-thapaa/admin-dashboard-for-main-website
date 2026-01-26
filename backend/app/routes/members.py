import datetime # To handle dates and times
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.member.member import Member
from app.schemas.members import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MemberRole,
)
from app.auth.deps import get_current_user # To check if the user is logged in

# Setup the router for all member-related links
router = APIRouter(prefix="/admin/members", tags=["Members"])


# 1. Create a new member (Team or Intern)
@router.post(
    "",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_member(
    payload: MemberCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Prepare the member data from the request
    member = Member(
        photo_url=payload.photo_url,
        name=payload.name,
        position=payload.position,
        start_date=payload.start_date,
        end_date=payload.end_date,
        social_media=payload.social_media.model_dump()
        if payload.social_media else None,
        contact_email=payload.contact_email,
        personal_email=payload.personal_email,
        contact_number=payload.contact_number,
        is_visible=payload.is_visible,
        role=payload.role,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow(),
    )

    # Save the new member to the database
    db.add(member)
    db.commit()
    db.refresh(member)

    return member

# 2. Get a list of ALL members
@router.get("", response_model=list[MemberResponse])
def list_members(
    db: Session = Depends(get_db),
    
):
    # Step 1: Get every member from the database
    return db.query(Member).all()

# 3. Get only the Team members
@router.get("/teams", response_model=list[MemberResponse])
def list_team_members(
    db: Session = Depends(get_db),
    
):
    # Step 1: Get only members who are marked as "TEAM" and are visible
    return (
        db.query(Member)
        .filter(
            Member.role == MemberRole.TEAM,
            Member.is_visible == True,
        )
        .all()
    )

# 4. Get only the Interns
@router.get("/interns", response_model=list[MemberResponse])
def list_intern_members(
    db: Session = Depends(get_db),
    
):
    # Step 1: Get only members who are marked as "INTERN" and are visible
    return (
        db.query(Member)
        .filter(
            Member.role == MemberRole.INTERN,
            Member.is_visible == True,
        )
        .all()
    )

# 5. Update a member's information
@router.patch("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: UUID,
    payload: MemberUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Find the member in the database by their ID
    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )
    # Step 2: Update only the fields that were sent in the request
    for field, value in payload.model_dump(
        exclude_unset=True,
        # exclude_none=True,  <-- REMOVED: We want to allow setting fields to None (e.g. removing photo)
    ).items():
        setattr(member, field, value)
    
    # Step 3: Update the "updated_at" timestamp to now
    member.updated_at = datetime.datetime.utcnow()

    # Step 4: Save changes to the database
    db.commit()
    db.refresh(member)

    return member


# 6. Get details of a specific Team member
@router.get("/team/{member_id}", response_model=MemberResponse)
def get_team_member(
    member_id: UUID,
    db: Session = Depends(get_db),
   
):
    # Step 1: Find the specific team member by their ID
    member = (
        db.query(Member)
        .filter(
            Member.id == member_id,
            Member.role == MemberRole.TEAM,
            Member.is_visible == True,
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Team member not found",
        )

    return member

# 7. Get details of a specific Intern
@router.get("/intern/{member_id}", response_model=MemberResponse)
def get_intern_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    
):
    # Step 1: Find the specific intern by their ID
    member = (
        db.query(Member)
        .filter(
            Member.id == member_id,
            Member.role == MemberRole.INTERN,
            Member.is_visible == True,
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Intern not found",
        )

    return member


# 8. Get any member by their ID (Admin only)
@router.get("/{member_id}", response_model=MemberResponse)
def get_member_admin(
    member_id: UUID,
    db: Session = Depends(get_db),
    
):
    # Admin must be able to fetch any member (visible or hidden)
    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return member



# delete a member by their id
@router.delete("/{member_id}")
def delete_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Find the member in the database by their ID
    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    # Step 2: Delete the member from the database
    db.delete(member)
    db.commit()

    return {"message": "Member deleted successfully"}

