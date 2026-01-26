from fastapi import APIRouter, Depends, HTTPException, status # Tools to build the API
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.projects.project import Project
from app.models.projects.feedback import ProjectFeedback
from app.models.projects.project_tech_map import ProjectTechMap
from app.models.services.service_teck import ServiceTech
from app.schemas.projects import ProjectCreate, ProjectResponse, ProjectUpdate
from app.auth.deps import get_current_user # To check if the user is logged in

# Setup the router for all project-related links
router = APIRouter(prefix="/admin/projects", tags=["Projects"])

# 1. Create a new project
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Create the main project record
    project = Project(
        title=payload.title,
        description=payload.description,
        photo_url=payload.photo_url,
        project_link=payload.project_link,
    )

    db.add(project)
    db.flush()  # This generates the ID so we can use it for the mapping below

    # Step 2: Find the technologies in the database
    techs = (
        db.query(ServiceTech)
        .filter(ServiceTech.id.in_(payload.tech_ids))
        .all()
    )

    # Step 3: Check if all IDs were valid
    if len(techs) != len(payload.tech_ids):
        raise HTTPException(
            status_code=400,
            detail="One or more tech IDs are invalid",
        )
    
    # Step 4: Link the project to the technologies
    for tech in techs:
        db.add(
            ProjectTechMap(
                project_id=project.id,
                tech_id=tech.id,
            )
        )
    
    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        photo_url=project.photo_url,
        techs=[tech.name for tech in techs],
        project_link=project.project_link,
        feedbacks=[],  # feedbacks are added later
        created_at=project.created_at,
        updated_at=project.updated_at,
    )

# 2. Get a list of all projects
@router.get("/", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    
):
    # Step 1: Get all projects from the database
    projects = db.query(Project).all()
    responses = []

    for project in projects:
        # Step 2: For each project, find its technology names
        techs = (
            db.query(ServiceTech.name)
            .join(ProjectTechMap, ProjectTechMap.tech_id == ServiceTech.id)
            .filter(ProjectTechMap.project_id == project.id)
            .all()
        )

        # Step 3: Find all reviews (feedbacks) for this project
        feedbacks = (
            db.query(ProjectFeedback)
            .filter(ProjectFeedback.project_id == project.id)
            .all()
        )

        # Step 4: Add the project details to the final list
        responses.append(
            ProjectResponse(
                id=project.id,
                title=project.title,
                description=project.description,
                photo_url=project.photo_url,
                techs=[t[0] for t in techs],
                project_link=project.project_link,
                feedbacks=[
                    {
                        "id": f.id,
                        "client_name": f.client_name,
                        "client_photo": f.client_photo,
                        "feedback_description": f.feedback_description,
                        "rating": f.rating,
                    }
                    for f in feedbacks
                ],
                created_at=project.created_at,
                updated_at=project.updated_at,
            )
        )

    return responses

# 3. Get details of one specific project
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_detail(
    project_id: UUID,
    db: Session = Depends(get_db),
    
):
    # Step 1: Find the project in the database
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Step 2: Find its technology names
    techs = (
        db.query(ServiceTech.name)
        .join(ProjectTechMap, ProjectTechMap.tech_id == ServiceTech.id)
        .filter(ProjectTechMap.project_id == project.id)
        .all()
    )

    # Step 3: Find its reviews (feedbacks)
    feedbacks = (
        db.query(ProjectFeedback)
        .filter(ProjectFeedback.project_id == project.id)
        .all()
    )

    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        photo_url=project.photo_url,
        techs=[t[0] for t in techs],
        project_link=project.project_link,
        feedbacks=[
            {
                "id": f.id,
                "client_name": f.client_name,
                "client_photo": f.client_photo,
                "feedback_description": f.feedback_description,
                "rating": f.rating,
            }
            for f in feedbacks
        ],
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


# 4. Update an existing project
@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Step 1: Update simple text fields
    for field, value in payload.model_dump(
        exclude_unset=True,
        # exclude_none=True, <-- REMOVED: Allow nulls (e.g. removing photo)
    ).items():
        if field != "tech_ids":
            setattr(project, field, value)
    
    # Step 2: Update the technology list if provided
    if payload.tech_ids is not None:
        techs = (
            db.query(ServiceTech)
            .filter(ServiceTech.id.in_(payload.tech_ids))
            .all()
        )

        if len(techs) != len(payload.tech_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more tech IDs are invalid",
            )

        # Step 3: Remove old links and add new ones
        db.query(ProjectTechMap).filter(
            ProjectTechMap.project_id == project.id
        ).delete()

        for tech in techs:
            db.add(
                ProjectTechMap(
                    project_id=project.id,
                    tech_id=tech.id,
                )
            )
            
    db.commit()
    db.refresh(project)

    techs = (
        db.query(ServiceTech.name)
        .join(ProjectTechMap, ProjectTechMap.tech_id == ServiceTech.id)
        .filter(ProjectTechMap.project_id == project.id)
        .all()
    )

    feedbacks = (
        db.query(ProjectFeedback)
        .filter(ProjectFeedback.project_id == project.id)
        .all()
    )

    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        photo_url=project.photo_url,
        techs=[t[0] for t in techs],
        project_link=project.project_link,
        feedbacks=[
            {
                "id": f.id,
                "client_name": f.client_name,
                "client_photo": f.client_photo,
                "feedback_description": f.feedback_description,
                "rating": f.rating,
            }
            for f in feedbacks
        ],
        created_at=project.created_at,
        updated_at=project.updated_at,
    )

# 5. Delete a project
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    admin = Depends(get_current_user),
):
    # Step 1: Find the project in the database
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Step 2: Remove the links to technologies first
    db.query(ProjectTechMap).filter(
        ProjectTechMap.project_id == project_id
    ).delete()

    # Step 3: Delete the project (reviews are deleted automatically)
    db.delete(project)
    db.commit()

    return
