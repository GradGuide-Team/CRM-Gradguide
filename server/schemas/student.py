# server/schemas/student.py
from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict
from typing import List, Optional, Literal, Any
from bson import ObjectId
from pydantic_core import core_schema
from datetime import date, datetime
from pydantic import field_validator

# Pydantic v2 compatible PyObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler):
        # This is the correct method for Pydantic v2
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda instance: str(instance)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema, handler):
        # Return a simple string schema for JSON
        return {"type": "string"}

class ApplicationStatusLogSchema(BaseModel):
    previous_status: Optional[str] = None
    new_status: str
    timestamp: datetime
    changed_by: dict
    university_choice_index: int

class UniversityNoteSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    created_by: dict
    created_at: datetime
    updated_at: datetime

class UniversityNoteCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class UniversityNoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class OverviewNoteSchema(BaseModel):
    type: Literal["manual", "automatic"]
    title: Optional[str] = None
    content: Optional[str] = None
    created_by: dict
    created_at: datetime
    related_university_index: Optional[int] = None

class OverviewNoteCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class UniversityChoiceBase(BaseModel):
    university_name: str = Field(..., min_length=3, max_length=100)
    course_name: str = Field(..., min_length=3, max_length=100)
    course_link: Optional[HttpUrl] = None
    intake_month: str = Field(..., min_length=3, max_length=50)
    application_status: Literal[
        "documents pending", 
        "documents received", 
        "application pending", 
        "application filed", 
        "conditional offer received", 
        "unconditional offer received", 
        "Uni finalized"
    ] = "documents pending"
    offer_type: Literal["Conditional", "Unconditional"] = "Conditional"
    application_submitted: bool = False
    additional_docs_requested: bool = False
    loa_cas_received: bool = False
    loan_process_started: bool = False
    fee_payment_completed: bool = False
    notes: List[UniversityNoteSchema] = []
    
    
class UniversityChoiceUpdate(BaseModel):
    university_name: Optional[str] = Field(None, min_length=3, max_length=100)
    course_name: Optional[str] = Field(None, min_length=3, max_length=100)
    course_link: Optional[HttpUrl] = None
    intake_month: Optional[str] = Field(None, min_length=3, max_length=50)
    application_status: Optional[Literal[
        "documents pending", 
        "documents received", 
        "application pending", 
        "application filed", 
        "conditional offer received", 
        "unconditional offer received", 
        "Uni finalized"
    ]] = None
    offer_type: Optional[Literal["Conditional", "Unconditional"]] = None
    application_submitted: Optional[bool] = None
    additional_docs_requested: Optional[bool] = None
    loa_cas_received: Optional[bool] = None
    loan_process_started: Optional[bool] = None
    fee_payment_completed: Optional[bool] = None


class VisaDocuments(BaseModel):
    decision: Literal["Pending", "Accepted", "Rejected"] = "Pending"
    counselling_started: bool = False
    documents_received: bool = False 
    application_filled: bool = False
    interview_scheduled: bool = False

class Documents(BaseModel):
    passport: bool= False
    marksheets: bool = False
    english_exam: bool = False
    sop: bool = False
    lor: bool = False
    resume: bool = False

class SchoolMarksheet(BaseModel):
    x_year: str = Field(...)
    x_school_name: str = Field(...)
    x_cgpa: str = Field(...)
    xii_year: str = Field(...)
    xii_school_name: str = Field(...)
    xii_cgpa: str = Field(...)
    xii_english: str = Field(...)
    xii_maths: Optional[str] = None
    xii_stream: str = Field(...)

class SemesterResult(BaseModel):
    semester: Optional[str] = None
    year: Optional[str] = None
    cgpa: Optional[str] = None
    grade: Optional[str] = None
    kt: Optional[str] = None

class UniversityDetails(BaseModel):
    college_name: Optional[str] = None
    branch_name: Optional[str] = None
    stream: Optional[str] = None
    university_name: Optional[str] = None
    degree_earned: Optional[str] = None
    fromYear: Optional[str] = None 
    toYear: Optional[str] = None
    semesters: Optional[List[SemesterResult]] = None
    overall_cgpa: Optional[str] = None
    final_grade: Optional[str] = None
    total_kt: Optional[str] = None

class UniversityMarksheet(BaseModel):
    semester: Optional[str] = None
    cgpa: Optional[int] = None
    backlog: Optional[int] = None
    year: Optional[str] = None
    
class StudentCreate(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email_address: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=20)
    target_country: str = Field(..., min_length=2, max_length=50)
    dob: date 
    parents_contact: Optional[str] = None
    parents_email: Optional[str] = None
    school_marksheet: Optional[SchoolMarksheet] = None
    university_details: Optional[UniversityDetails] = None  
    university_marksheet: Optional[List[UniversityMarksheet]] = None 
    assigned_counselor_id: Optional[PyObjectId] = None 
    application_path: Literal["Direct", "SI", "Eduwise"] = "Direct"
    degree_type: Literal["Undergraduation", "Masters", "PHD"] = "Masters"
    university_choices: List[UniversityChoiceBase] = Field(..., min_length=1, max_length=5)
    documents: Optional[Documents] = None 
    visa_documents: Optional[VisaDocuments] = None

    @field_validator('dob')
    @classmethod
    def dob_must_be_in_past(cls, v):
        if v >= date.today():
            raise ValueError('Date of birth must be in the past')
        return v


class StudentPublic(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
    
    id: PyObjectId = Field(alias="_id")
    full_name: str
    email_address: EmailStr
    phone_number: str
    target_country: str
    degree_type: Optional[str] = None 
    dob: Optional[date] = None
    parents_contact: Optional[str] = None
    parents_email: Optional[str] = None
    assigned_counselor: Optional[dict] = None 
    assigned_counselor_id: Optional[PyObjectId] = None 
    school_marksheet: Optional[SchoolMarksheet] = None  
    university_details: Optional[UniversityDetails] = None 
    university_marksheet: Optional[List[UniversityMarksheet]] = None 
    created_by: Optional[dict] = None 
    created_by_id: Optional[PyObjectId] = None 

    application_path: str
    documents: Documents
    university_choices: List[UniversityChoiceBase]
    visa_documents: VisaDocuments
    status_logs: List[ApplicationStatusLogSchema] = []
    overview_notes: List[OverviewNoteSchema] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3, max_length=100)
    email_address: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    target_country: Optional[str] = Field(None, min_length=2, max_length=50)
    dob: Optional[date] = None 
    assigned_counselor_id: Optional[PyObjectId] = None
    application_path: Optional[Literal["Direct", "SI", "Eduwise"]] = None
    degree_type: Optional[Literal["Undergraduation", "Masters", "PHD"]] = None
    visa_documents: Optional[VisaDocuments] = None
    university_choices: Optional[List[UniversityChoiceUpdate]] = None 
    documents: Optional[Documents] = None
    parents_contact: Optional[str] = None
    parents_email: Optional[str] = None
    school_marksheet: Optional[SchoolMarksheet] = None 
    university_details: Optional[UniversityDetails] = None 
    university_marksheet: Optional[List[UniversityMarksheet]] = None 
    
    @field_validator('dob')
    @classmethod
    def dob_must_be_in_past(cls, v):
        if v is not None and v >= date.today():
            raise ValueError('Date of birth must be in the past')
        return v

# Additional schemas for specific operations
class ApplicationStatusUpdateRequest(BaseModel):
    university_choice_index: int = Field(..., ge=0, le=4)
    new_status: Literal[
        "documents pending", 
        "documents received", 
        "application pending", 
        "application filed", 
        "conditional offer received", 
        "unconditional offer received", 
        "Uni finalized"
    ]