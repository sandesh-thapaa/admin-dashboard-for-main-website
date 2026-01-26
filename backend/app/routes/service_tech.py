from fastapi import APIRouter, Depends, HTTPException, status # Tools to build the API
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.auth.deps import get_current_user # To check if the user is logged in
from app.models.services.service_teck import ServiceTech
from app.models.services.service_tech_map import ServiceTechMap
from app.schemas.service_tech import (
    ServiceTechCreate,
    ServiceTechResponse,
)

# Setup the router for technologies (tech stack)
router = APIRouter(
    prefix="/admin/service-techs",
    tags=["Service Techs"],
)

# 1. Create a new technology name
@router.post(
    "",
    response_model=ServiceTechResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_tech(
    payload: ServiceTechCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Check if this technology name already exists
    existing = (
        db.query(ServiceTech)
        .filter(ServiceTech.name == payload.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Service tech already exists",
        )

    # Step 2: Create the new technology record
    tech = ServiceTech(name=payload.name)

    # Step 3: Save to database
    db.add(tech)
    db.commit()
    db.refresh(tech)

    return tech

# 2. Get a list of all technologies
@router.get("", response_model=list[ServiceTechResponse])
def list_service_techs(
    db: Session = Depends(get_db),
    
):
    # Simple list for admin selection
    return db.query(ServiceTech).all()


# 3. Delete a technology with validation
@router.delete("/{tech_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_tech(
    tech_id: UUID,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    """
    Delete a technology only if it's not used by any service.
    If used, returns error with list of service names.
    """
    # Find the technology in database
    tech = db.query(ServiceTech).filter(ServiceTech.id == tech_id).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technology not found")
    
    # Check if technology is used by any services
    services_using_tech = db.query(ServiceTechMap).filter(ServiceTechMap.tech_id == tech_id).all()
    
    # If technology is used, prevent deletion
    if services_using_tech:
        service_count = len(services_using_tech)
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete technology. Currently used by {service_count} service(s). Remove from services first."
        )
    
    # If not used, safe to delete
    db.delete(tech)
    db.commit()
    
    return
