from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional

from server.schemas.student import (
    StudentCreate, StudentPublic, StudentUpdate, 
    ApplicationStatusUpdateRequest, UniversityNoteCreate, OverviewNoteCreate
)
from server.crud import student as crud_student
from server.crud import user as crud_user
from server.core.auth import get_current_user # This dependency provides the current logged-in user

router = APIRouter()

@router.post("/students", response_model=StudentPublic, status_code=status.HTTP_201_CREATED)
async def create_student_endpoint(
    student_in: StudentCreate,
    current_user: dict = Depends(get_current_user) # Get the current authenticated user
):
    """
    Create a new student record.
    Requires authentication. The creator is automatically set to the current user.
    """
    # If an assigned_counselor_id is provided, ensure it's a valid user
    if student_in.assigned_counselor_id:
        counselor_exists = await crud_user.get_user_by_id(str(student_in.assigned_counselor_id))
        if not counselor_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Assigned counselor with ID {student_in.assigned_counselor_id} not found."
            )

    try:
        creator_user_obj = await crud_user.get_user_by_id(current_user["id"])
        if not creator_user_obj:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Creator user not found in DB.")

        student = await crud_student.create_student(student_in, creator_user_obj)
        return student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create student: {e}")

@router.get("/students",response_model=List[StudentPublic])
async def read_student_endpoint(
    skip: int = Query(0,ge=0),
    limit: int = Query(10, le=10),
    populate_counselor: bool = Query(True, description="Include full counselor details"),
    populate_creator: bool = Query(False, description="Include full creator details"), # NEW Query param
    current_user: dict = Depends(get_current_user)
):
    students = await crud_student.get_all_students(
        current_user_id=current_user["id"],
        current_user_role=current_user["role"],
        skip=skip,
        limit=limit,
        populate_counselor=populate_counselor,
        populate_creator=populate_creator
    )
    return students

@router.get("/students/{student_id}", response_model=StudentPublic)
async def read_student_by_id_endpoint(
    student_id: str,
    populate_counselor: bool = Query(True, description="Include full counselor details"),
    populate_creator: bool = Query(False, description="Include full creator details"), # NEW Query param
    current_user: dict = Depends(get_current_user) # Get the current authenticated user
):

    student = await crud_student.get_student_by_id(
        student_id,
        current_user_id=current_user["id"],
        current_user_role=current_user["role"],
        populate_counselor=populate_counselor,
        populate_creator=populate_creator
    )
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found or unauthorized access.")
    
    return student

@router.put("/students/{student_id}/application-status", response_model=StudentPublic)
async def update_student_application_status(
    student_id: str,
    status_update: ApplicationStatusUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        creator_user_obj = await crud_user.get_user_by_id(current_user["id"])
        if not creator_user_obj:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User not found in DB.")

        updated_student = await crud_student.update_application_status(
            student_id=student_id,
            status_update=status_update,
            current_user_id=current_user["id"],
            current_user_role=current_user["role"],
            current_user=creator_user_obj
        )
        
        if not updated_student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        
        return updated_student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update status: {e}")

@router.post("/students/{student_id}/university-notes/{university_index}", response_model=StudentPublic)
async def add_university_note_endpoint(
    student_id: str,
    university_index: int,
    note_data: UniversityNoteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        creator_user_obj = await crud_user.get_user_by_id(current_user["id"])
        if not creator_user_obj:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User not found in DB.")

        updated_student = await crud_student.add_university_note(
            student_id=student_id,
            university_index=university_index,
            note_data=note_data,
            current_user_id=current_user["id"],
            current_user_role=current_user["role"],
            current_user=creator_user_obj
        )
        
        if not updated_student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        
        return updated_student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add note: {e}")

@router.post("/students/{student_id}/overview-notes", response_model=StudentPublic)
async def add_overview_note_endpoint(
    student_id: str,
    note_data: OverviewNoteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        creator_user_obj = await crud_user.get_user_by_id(current_user["id"])
        if not creator_user_obj:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User not found in DB.")

        updated_student = await crud_student.add_overview_note(
            student_id=student_id,
            note_data=note_data,
            current_user_id=current_user["id"],
            current_user_role=current_user["role"],
            current_user=creator_user_obj
        )
        
        if not updated_student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        
        return updated_student
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add note: {e}")
    
    
@router.patch("/students/{student_id}", response_model=StudentPublic)
async def update_student_endpoint(
    student_id: str,
    student_update: StudentUpdate, # Use the StudentUpdate schema for partial updates
    current_user: dict = Depends(get_current_user) # Requires authentication
):

    try:
        updated_student = await crud_student.update_student(
            student_id,
            student_update,
            current_user["id"],
            current_user["role"]
        )
        if not updated_student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found or unauthorized access.")
        return updated_student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update student: {e}")

@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student_endpoint(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        success = await crud_student.delete_student(
            student_id,
            current_user["id"],
            current_user["role"]
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Student not found or unauthorized access."
            )
        
        return None  # 204 No Content

    except HTTPException as e:
        raise e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete student: {e}"
        )
