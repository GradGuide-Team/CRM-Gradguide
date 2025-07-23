# server/crud/student.py
from datetime import datetime, timezone
from typing import List, Optional
from server.db.models import Student, User, UniversityChoice, SchoolMarksheet, DocumentsRequired, VisaDocuments, ApplicationStatusLog, OverviewNote, UniversityNote, UniversityDetails, UniversityMarksheet
from server.schemas.student import (
    StudentCreate, StudentPublic, StudentUpdate, UniversityNoteCreate, 
    UniversityNoteUpdate, OverviewNoteCreate, ApplicationStatusUpdateRequest
)
from bson import ObjectId
from pydantic import HttpUrl


def create_initial_logs_and_notes(student: Student, creator_user: User):
    """Create initial status logs and overview notes when student is created"""
    now = datetime.now(timezone.utc)

    for index, university_choice in enumerate(student.university_choices):
        status_log = ApplicationStatusLog(
            previous_status=None,
            new_status="documents pending",
            timestamp=now,
            changed_by=creator_user,
            university_choice_index=index
        )
        student.status_logs.append(status_log)
        overview_note = OverviewNote(
            type="automatic",
            title="Initial Status Set",
            content=f"Application status set to 'documents pending' for {university_choice.university_name}",
            created_by=creator_user,
            created_at=now,
            related_university_index=index
        )
        student.overview_notes.append(overview_note)


async def create_student(student_data: StudentCreate, creator_user: User):
    university_choices_docs = []
    for choice in student_data.university_choices:
        course_link_str = str(choice.course_link) if isinstance(choice.course_link, HttpUrl) else choice.course_link
        university_choices_docs.append(
            UniversityChoice(
                university_name=choice.university_name,
                course_name=choice.course_name,
                course_link=course_link_str, 
                intake_month=choice.intake_month,
                application_status="documents pending",  
                offer_type=choice.offer_type,
                application_submitted=choice.application_submitted,
                additional_docs_requested=choice.additional_docs_requested,
                loa_cas_received=choice.loa_cas_received,
                loan_process_started=choice.loan_process_started,
                fee_payment_completed=choice.fee_payment_completed,
                notes=[] 
            )
        )

    assigned_counselor_obj = None
    if student_data.assigned_counselor_id:
        counselor = User.objects(id=student_data.assigned_counselor_id).first()
        if not counselor:
            raise ValueError(f"Assigned counselor with ID {student_data.assigned_counselor_id} not found.")
        assigned_counselor_obj = counselor

    school_marksheet_obj = None
    if hasattr(student_data, 'school_marksheet') and student_data.school_marksheet:
        school_marksheet_obj = SchoolMarksheet(**student_data.school_marksheet.model_dump())

    university_details_obj = None
    if hasattr(student_data, 'university_details') and student_data.university_details:
        university_details_obj = UniversityDetails(**student_data.university_details.model_dump())

    university_marksheet_docs = []
    if hasattr(student_data, 'university_marksheet') and student_data.university_marksheet:
        for marksheet in student_data.university_marksheet:
            university_marksheet_docs.append(UniversityMarksheet(**marksheet.model_dump()))

    now_utc = datetime.now(timezone.utc).isoformat()

    student = Student(
        full_name=student_data.full_name,
        email_address=student_data.email_address,
        phone_number=student_data.phone_number,
        target_country=student_data.target_country,
        assigned_counselor=assigned_counselor_obj,
        degree_type=student_data.degree_type,
        dob=student_data.dob,
        created_by=creator_user, 
        application_path=student_data.application_path,
        parents_contact=student_data.parents_contact,  # Add this
        parents_email=student_data.parents_email,
        school_marksheet=school_marksheet_obj,
        university_details=university_details_obj,
        university_marksheet=university_marksheet_docs,
        university_choices=university_choices_docs,
        status_logs=[],
        overview_notes=[],
        created_at=now_utc,
        updated_at=now_utc
    )
    student.save()

    return StudentPublic.model_validate(student.to_public_dict())

async def get_all_students(
    current_user_id: str,
    current_user_role: str,
    skip: int = 0,
    limit: int = 10,
    name_search: Optional[str] = None,
    country_search: Optional[str] = None,
    populate_counselor: bool = False,
    populate_creator: bool = False
) -> List[StudentPublic]:
    query_set = Student.objects

    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    # Add search filters
    if name_search:
        query_set = query_set.filter(full_name__icontains=name_search)
    if country_search:
        query_set = query_set.filter(target_country__icontains=country_search)

    students = query_set.skip(skip).limit(limit)
    
    result = []
    for student in students:
        # Manually populate references if needed
        if populate_counselor and student.assigned_counselor:
            # Force fetch the counselor
            student.assigned_counselor.reload()
        
        if populate_creator and student.created_by:
            # Force fetch the creator
            student.created_by.reload()
        
        for log in student.status_logs:
            if log.changed_by:
                log.changed_by.reload()
        
        for note in student.overview_notes:
            if note.created_by:
                note.created_by.reload()
        
        for choice in student.university_choices:
            for note in choice.notes:
                if note.created_by:
                    note.created_by.reload()
            
        result.append(StudentPublic.model_validate(student.to_public_dict()))
    
    return result

async def get_student_by_id(
    student_id: str,
    current_user_id: str, 
    current_user_role: str, 
    populate_counselor: bool = False,
    populate_creator: bool = False 
) -> Optional[StudentPublic]:

    if not ObjectId.is_valid(student_id):
        return None 

    query_set = Student.objects(id=student_id)

    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    student = query_set.first()
    
    if not student:
        return None
    
    if populate_counselor and student.assigned_counselor:
        student.assigned_counselor.reload()
    
    if populate_creator and student.created_by:
        student.created_by.reload()
    
    for log in student.status_logs:
        if log.changed_by:
            log.changed_by.reload()
    
    for note in student.overview_notes:
        if note.created_by:
            note.created_by.reload()
    
    for choice in student.university_choices:
        for note in choice.notes:
            if note.created_by:
                note.created_by.reload()
    
    return StudentPublic.model_validate(student.to_public_dict())

async def update_application_status(
    student_id: str,
    status_update: ApplicationStatusUpdateRequest,
    current_user_id: str,
    current_user_role: str,
    current_user: User
) -> Optional[StudentPublic]:
    """Update application status and create logs automatically"""
    if not ObjectId.is_valid(student_id):
        return None
    
    query_set = Student.objects(id=student_id)
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    student = query_set.first()
    if not student:
        return None
    
    # Check if university choice index is valid
    if status_update.university_choice_index >= len(student.university_choices):
        raise ValueError("Invalid university choice index")
    
    university_choice = student.university_choices[status_update.university_choice_index]
    old_status = university_choice.application_status
    new_status = status_update.new_status
    
    # Only create logs if status actually changed
    if old_status != new_status:
        now = datetime.now(timezone.utc)
        
        # Create status log
        status_log = ApplicationStatusLog(
            previous_status=old_status,
            new_status=new_status,
            timestamp=now,
            changed_by=current_user,
            university_choice_index=status_update.university_choice_index
        )
        student.status_logs.append(status_log)
        
        # Create automatic overview note
        overview_note = OverviewNote(
            type="automatic",
            title="Application Status Updated",
            content=f"Status changed from '{old_status}' to '{new_status}' for {university_choice.university_name}",
            created_by=current_user,
            created_at=now,
            related_university_index=status_update.university_choice_index
        )
        student.overview_notes.append(overview_note)
        
        # Update the actual status
        student.university_choices[status_update.university_choice_index].application_status = new_status
        student.updated_at = now.isoformat()
        student.save()
    
    return StudentPublic.model_validate(student.to_public_dict())

async def add_university_note(
    student_id: str,
    university_index: int,
    note_data: UniversityNoteCreate,
    current_user_id: str,
    current_user_role: str,
    current_user: User
) -> Optional[StudentPublic]:
    """Add a note to a specific university choice"""
    if not ObjectId.is_valid(student_id):
        return None
    
    query_set = Student.objects(id=student_id)
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    student = query_set.first()
    if not student:
        return None
    
    if university_index >= len(student.university_choices):
        raise ValueError("Invalid university choice index")
    
    now = datetime.now(timezone.utc)
    
    university_note = UniversityNote(
        title=note_data.title,
        description=note_data.description,
        created_by=current_user,
        created_at=now,
        updated_at=now
    )
    
    student.university_choices[university_index].notes.append(university_note)
    student.updated_at = now.isoformat()
    student.save()
    
    return StudentPublic.model_validate(student.to_public_dict())

async def add_overview_note(
    student_id: str,
    note_data: OverviewNoteCreate,
    current_user_id: str,
    current_user_role: str,
    current_user: User
) -> Optional[StudentPublic]:
    """Add a manual overview note"""
    if not ObjectId.is_valid(student_id):
        return None
    
    query_set = Student.objects(id=student_id)
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    student = query_set.first()
    if not student:
        return None
    
    now = datetime.now(timezone.utc)
    
    overview_note = OverviewNote(
        type="manual",
        title=note_data.title,
        content=note_data.content,
        created_by=current_user,
        created_at=now,
        related_university_index=None
    )
    
    student.overview_notes.append(overview_note)
    student.updated_at = now.isoformat()
    student.save()
    
    return StudentPublic.model_validate(student.to_public_dict())


async def update_student(
    student_id: str,
    student_update_data: StudentUpdate,
    current_user_id: str,
    current_user_role: str
) -> Optional[StudentPublic]:
    if not ObjectId.is_valid(student_id):
        return None
    
    query_set = Student.objects(id=student_id)
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))

    student = query_set.first()
    if not student:
        return None
    
    update_data = student_update_data.model_dump(exclude_unset=True)

    # Handle university choices update (but not status changes - use separate endpoint for those)
    if "university_choices" in update_data and update_data["university_choices"] is not None:
        university_choices_docs = []
        for index, choice_data in enumerate(update_data["university_choices"]):
            course_link_val = choice_data.get('course_link') 
            course_link_str = str(course_link_val) if isinstance(course_link_val, HttpUrl) else course_link_val

            existing_notes = []
            if index < len(student.university_choices):
                existing_notes = student.university_choices[index].notes

            university_choices_docs.append(
                UniversityChoice(
                    university_name=choice_data['university_name'],
                    course_name=choice_data['course_name'],
                    course_link=course_link_str, 
                    intake_month=choice_data['intake_month'],
                    application_status=choice_data.get('application_status', 'documents pending'),
                    offer_type=choice_data.get('offer_type', 'Conditional'),
                    application_submitted=choice_data.get('application_submitted', False),
                    additional_docs_requested=choice_data.get('additional_docs_requested', False),
                    loa_cas_received=choice_data.get('loa_cas_received', False),
                    loan_process_started=choice_data.get('loan_process_started', False),
                    fee_payment_completed=choice_data.get('fee_payment_completed', False),
                    notes=existing_notes
                )
            )
        student.university_choices = university_choices_docs
        del update_data["university_choices"]
        
    if "school_marksheet" in update_data and update_data["school_marksheet"] is not None:
        from server.db.models import SchoolMarksheet  # Add this import at top
        school_marksheet_data = update_data["school_marksheet"]
        school_marksheet_obj = SchoolMarksheet(**school_marksheet_data)
        student.school_marksheet = school_marksheet_obj
        del update_data["school_marksheet"]
        
    if "university_details" in update_data and update_data["university_details"] is not None:
        university_details_data = update_data["university_details"]
        university_details_obj = UniversityDetails(**university_details_data)
        student.university_details = university_details_obj
        del update_data["university_details"]
    
    if "university_marksheet" in update_data and update_data["university_marksheet"] is not None:
        university_marksheet_docs = []
        for marksheet_data in update_data["university_marksheet"]:
            university_marksheet_docs.append(UniversityMarksheet(**marksheet_data))
        student.university_marksheet = university_marksheet_docs
        del update_data["university_marksheet"]
        
    # Handle other updates (documents, visa_documents, etc.)
    if "documents" in update_data and update_data["documents"] is not None:
        documents_data = update_data["documents"]
        documents_doc = DocumentsRequired(
            passport=documents_data.get('passport', False),
            marksheets=documents_data.get('marksheets', False),  
            english_exam=documents_data.get('english_exam', False),  
            sop=documents_data.get('sop', False),  
            lor=documents_data.get('lor', False), 
            resume=documents_data.get('resume', False)  
        )
        student.documents = documents_doc
        del update_data["documents"]

    if "visa_documents" in update_data and update_data["visa_documents"] is not None:
        visa_docs_data = update_data["visa_documents"]
        visa_docs_doc = VisaDocuments(
            decision=visa_docs_data.get('decision', 'Pending'),
            counselling_started=visa_docs_data.get('counselling_started', False),
            documents_received=visa_docs_data.get('documents_received', False),
            application_filled=visa_docs_data.get('application_filled', False),
            interview_scheduled=visa_docs_data.get('interview_scheduled', False)
        )
        student.visa_documents = visa_docs_doc
        del update_data["visa_documents"]
    
    if "assigned_counselor_id" in update_data:
        counselor_id = update_data.pop("assigned_counselor_id")
        if counselor_id is not None:
            counselor = User.objects(id=counselor_id).first()
            if not counselor:
                raise ValueError(f"Assigned counselor with ID {counselor_id} not found.")
            student.assigned_counselor = counselor
        else:
            student.assigned_counselor = None
    
    for field, value in update_data.items():
        setattr(student, field, value)
    
    student.updated_at = datetime.now(timezone.utc).isoformat()
    student.save()
    student.reload()

    return StudentPublic.model_validate(student.to_public_dict())

async def delete_student(
    student_id: str,
    current_user_id: str,
    current_user_role: str
) -> bool:
    """
    Delete a student record.
    Returns True if successful, False if student not found or unauthorized.
    """
    if not ObjectId.is_valid(student_id):
        return False
    
    query_set = Student.objects(id=student_id)
    
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))
    
    student = query_set.first()
    if not student:
        return False
    
    student.delete()
    return True
