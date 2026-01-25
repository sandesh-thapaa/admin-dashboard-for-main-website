from fastapi import APIRouter, Depends, HTTPException, status # Tools to build the API
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.auth.deps import get_current_user # To check if the user is logged in
from app.models.training.mentor import Mentor
from app.models.training.training_mentor import TrainingMentor
from app.schemas.mentor import MentorCreate, MentorUpdate, MentorResponse

# Setup the router for all mentor-related links
router = APIRouter(
    prefix="/admin/mentors",
    tags=["Mentors"],
)

@router.get("/", response_model=list[MentorResponse])
# 1. Get a list of all mentors
def list_mentors(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Step 1: Get all mentors from the database and sort them by name
    mentors = (
        db.query(Mentor)
        .order_by(Mentor.name.asc())
        .all()
    )

    return mentors

@router.post("/", response_model=MentorResponse)
# 2. Add a new mentor
def create_mentor(
    data: MentorCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Step 1: Clean the name (remove extra spaces and make lowercase)
    name_normalized = data.name.strip().lower()
    # Step 2: Check if the mentor already exists in the database
    existing = (
        db.query(Mentor)
        .filter(Mentor.name.ilike(name_normalized))
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Mentor already exists",
        )

    # Step 3: Create the new mentor record
    mentor = Mentor(
        name=name_normalized,
        photo_url=data.photo_url,
    )

    # Step 4: Save to database
    db.add(mentor)
    db.commit()
    db.refresh(mentor)

    return mentor


# get mentor detail
@router.get("/{mentor_id}", response_model=MentorResponse)
# 3. Get details of one specific mentor
def get_mentor(
    mentor_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()

    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    return mentor

@router.put("/{mentor_id}", response_model=MentorResponse)
# 4. Update a mentor's information
def update_mentor(
    mentor_id: UUID,
    data: MentorUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()

    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    # Step 1: Update the name and photo if they were provided
    if data.name is not None:
         mentor.name = data.name.strip().lower()

    if data.photo_url is not None:
        mentor.photo_url = data.photo_url

    # Step 2: Save the updates
    db.commit()
    db.refresh(mentor)

    return mentor


#  delete mentor with proper validation
@router.delete("/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mentor(
    mentor_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    """
    Delete a mentor only if they are not assigned to any training.
    If assigned, returns error with list of training names.
    """
    #  find mentor in db
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # check if mentor is assigned to any training
    assigned_trainings = db.query(TrainingMentor).filter(TrainingMentor.mentor_id == mentor_id).all()
    # if mentor has training
    if assigned_trainings:
        # get the training names
        training_names = []
        for tm in assigned_trainings:
            training_names.append(tm.training.title)
        
        training_list = ", ".join(training_names)
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete mentor. Currently assigned to {len(assigned_trainings)} training(s): {training_list}"
        )
    
    #  if not assigned delete mentor
    db.delete(mentor)
    db.commit()

    return

    