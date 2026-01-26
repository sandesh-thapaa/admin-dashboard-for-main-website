from fastapi import APIRouter, Depends, HTTPException, Query # Tools to build the API
from app.db.session import get_db
from sqlalchemy.orm import Session, selectinload
from app.schemas.training import TrainingCreate, TrainingUpdate, TrainingResponse, MentorResponse
from app.auth.deps import get_current_user # To check if the user is logged in
from typing import List
from decimal import Decimal
from app.models.training.training import Training
from app.models.training.benefit import TrainingBenefit
from app.models.training.mentor import Mentor
from app.models.training.training_mentor import TrainingMentor
from app.models.pricing.enums import DiscountType
from uuid import UUID

# Setup the router for all training and course links
router = APIRouter(
    prefix="/admin/trainings",
    tags=["Trainings"]
)
# ---------- shared pricing logic (single source of truth) ----------
# Helper function to calculate the final price after discount
def calculate_effective_price(base_price: Decimal, discount_value: Decimal, discount_type: DiscountType | None,) -> Decimal:
    if not discount_value or not discount_type:
        return base_price
    if discount_type == DiscountType.PERCENTAGE:
        return base_price - (base_price * discount_value / Decimal(100))
    return base_price - discount_value

# ---------- shared api response (used by CREATE, GET, UPDATE) ----------
# Helper function to format the training data for the frontend
def training_response(training:Training)->TrainingResponse:
        effective_price = calculate_effective_price(
        training.base_price,
        training.discount_value,
        training.discount_type,
    )
        return TrainingResponse(
        id=str(training.id),
        title=training.title,
        description=training.description,
        photo_url=training.photo_url,
        base_price=training.base_price,
        effective_price=effective_price,
        benefits=[b.text for b in training.benefits],  # read from DB, not request
        mentors=[
            MentorResponse(
                id=str(m.mentor.id),
                name=m.mentor.name,
                photo_url=m.mentor.photo_url,
                specialization=m.mentor.specialization,
            )
            for m in training.training_mentors
        ],
        created_at=training.created_at,
        updated_at=training.updated_at,
    )

# ==================  Crud operations ======================#
# 1. Create a new training course
@router.post("/", response_model=TrainingResponse)
def create_training(
    data: TrainingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Step 1: Create the main training record
    training = Training(
        title=data.title,
        description=data.description,
        photo_url=data.photo_url,
        base_price=data.base_price,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
    )
    db.add(training)
    db.flush()  # Get the ID for the next steps

    # Step 2: Add the benefits list
    for benefit_text in data.benefits:
        db.add(
            TrainingBenefit(
                training_id=training.id,
                text=benefit_text,
            )
        )

    # Step 3: Link the mentors to this training
    for mentor_id in data.mentor_ids:
        mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()

        if not mentor:
            raise HTTPException(
                status_code=400,
                detail=f"Mentor {mentor_id} does not exist",
            )

        db.add(
            TrainingMentor(
                training_id=training.id,
                mentor_id=mentor.id,
            )
        )

    # ✅ commit ONCE
    db.commit()

    # ✅ refresh AFTER commit
    db.refresh(training)

    # ✅ ALWAYS return
    return training_response(training)


# ================== LIST TRAININGS ==================
# 2. Get a list of all training courses (with pagination)
@router.get("/", response_model=dict)
def list_trainings(
    page: int = Query(1, ge=1),          # 1-based pagination
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    
):
    # Step 1: Count the total number of training courses
    total = db.query(Training).count()
    # Step 2: Get the list of courses for the current page
    trainings = (
        db.query(Training).options(
            selectinload(Training.benefits),          # load benefits
            selectinload(Training.training_mentors)   # load mentors join
            .selectinload(TrainingMentor.mentor)      # load mentor itself
        )
        .order_by(Training.created_at.desc())
        .offset((page - 1)* page_size)
        .limit(page_size)
        .all()
    )
    # build response
    items = [training_response(t) for t in trainings]
    return {
        "items":items,
        "page": page,
        "page_size": page_size,
        "total": total,
    }

    

# 3. Get details of one specific training course
@router.get("/{training_id}", response_model=TrainingResponse)
def get_training_detail(training_id: UUID, db: Session =Depends(get_db)):
    # Step 1: Find the training course in the database
    training = (
        db.query(Training)
        .options(
            selectinload(Training.benefits),                # load benefits
            selectinload(Training.training_mentors)
            .selectinload(TrainingMentor.mentor),           # load mentors
        )
        .filter(Training.id == training_id).first()
    )
    if not training:
        raise HTTPException(status_code=404, detail="Training program not found")
    return training_response(training)

# ================== UPDATE TRAINING ==================

# 4. Update an existing training course
@router.put("/{training_id}", response_model=TrainingResponse)
def update_training(
    training_id: UUID,
    data: TrainingUpdate,
    db:Session= Depends(get_db),
    user = Depends(get_current_user),
):
    # load training with relations
    training = (
        db.query(Training)
        .options(
            selectinload(Training.benefits),
            selectinload(Training.training_mentors),
        )
        .filter(Training.id == training_id)
        .first()
    )

    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    
     # Step 1: Update basic fields
    # Use model_dump(exclude_unset=True) to only update fields that were sent
    update_data = data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        # Skip list fields (handled separately below)
        if field not in ["benefits", "mentor_ids"]:
            setattr(training, field, value)

    # Step 2: Replace the benefits list
    if data.benefits is not None:
        training.benefits.clear() 
        for benefit_text in data.benefits:
            training.benefits.append(
                TrainingBenefit(text=benefit_text)
            )
    
    # Step 3: Replace the mentors list
    if data.mentor_ids is not None:
        training.training_mentors.clear() 

        for mentor_id in data.mentor_ids:
            mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()

            if not mentor:
                raise HTTPException(400, f"Mentor {mentor_id} does not exist")
        
            
            training.training_mentors.append(
                TrainingMentor(mentor_id=mentor.id)
            )
     # single commit = atomic update
    db.commit()
    db.refresh(training)

    return training_response(training)
    

# 5. Delete a training course
@router.delete("/{training_id}", status_code=204)
def delete_training(
    training_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Step 1: Find the training course in the database
    training = db.query(Training).filter(Training.id == training_id).first()

    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    
    # Step 2: Delete the course and save changes
    db.delete(training)
    db.commit()

    # 204 = success, no response body
    return
    
