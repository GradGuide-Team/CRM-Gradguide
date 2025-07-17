# server/crud/student.py
from datetime import datetime, timezone
from typing import List, Optional

from server.db.models import Student, User, UniversityChoice, DocumentsRequired, VisaDocuments
from server.schemas.student import StudentCreate, StudentPublic, StudentUpdate
from bson import ObjectId
from pydantic import HttpUrl

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
                application_status=choice.application_status,
                offer_type=choice.offer_type,
                application_submitted=choice.application_submitted,
                additional_docs_requested=choice.additional_docs_requested,
                loa_cas_received=choice.loa_cas_received,
                loan_process_started=choice.loan_process_started,
                fee_payment_completed=choice.fee_payment_completed
            )
        )

    assigned_counselor_obj = None
    if student_data.assigned_counselor_id:
        counselor = User.objects(id=student_data.assigned_counselor_id).first()
        if not counselor:
            raise ValueError(f"Assigned counselor with ID {student_data.assigned_counselor_id} not found.")
        assigned_counselor_obj = counselor

    now_utc = datetime.now(timezone.utc).isoformat()

    student = Student(
        full_name=student_data.full_name,
        email_address=student_data.email_address,
        phone_number=student_data.phone_number,
        target_country=student_data.target_country,
        assigned_counselor=assigned_counselor_obj,
        degree_type= student_data.degree_type,
        dob= student_data.dob,
        created_by=creator_user, 
        application_path=student_data.application_path,
        university_choices=university_choices_docs,
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
    populate_counselor: bool = False,
    populate_creator: bool = False 
) -> List[StudentPublic]:
    query_set = Student.objects

    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))
    
    # Get students first
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
    
    # Manually populate references if needed
    if populate_counselor and student.assigned_counselor:
        # Force fetch the counselor
        student.assigned_counselor.reload()
    
    if populate_creator and student.created_by:
        # Force fetch the creator
        student.created_by.reload()
    
    return StudentPublic.model_validate(student.to_public_dict())


async def update_student(
    student_id:str,
    student_update_data : StudentUpdate,
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

    if "university_choices" in update_data and update_data["university_choices"] is not None:
        university_choices_docs = []
        for choice_data in update_data["university_choices"]:
            course_link_val = choice_data.get('course_link') 
            course_link_str = str(course_link_val) if isinstance(course_link_val, HttpUrl) else course_link_val

            university_choices_docs.append(
                UniversityChoice(
                    university_name=choice_data['university_name'],
                    course_name=choice_data['course_name'],
                    course_link=course_link_str, 
                    intake_month=choice_data['intake_month'],
                    application_status=choice_data['application_status'],
                    offer_type=choice_data['offer_type'],
                    application_submitted=choice_data['application_submitted'],
                    additional_docs_requested=choice_data['additional_docs_requested'],
                    loa_cas_received=choice_data['loa_cas_received'],
                    loan_process_started=choice_data['loan_process_started'],
                    fee_payment_completed=choice_data['fee_payment_completed']
                )
            )
        student.university_choices = university_choices_docs
        del update_data["university_choices"]
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
    
    # Apply role-based filtering - members can only delete their own students
    if current_user_role == "member":
        query_set = query_set.filter(created_by=ObjectId(current_user_id))
    
    student = query_set.first()
    if not student:
        return False
    
    # Delete the student
    student.delete()
    return True
