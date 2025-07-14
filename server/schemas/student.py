# server/schemas/student.py
from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict
from typing import List, Optional, Literal, Any
from bson import ObjectId
from pydantic_core import core_schema

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

class UniversityChoiceBase(BaseModel):
    university_name: str = Field(..., min_length=3, max_length=100)
    course_name: str = Field(..., min_length=3, max_length=100)
    course_link: Optional[HttpUrl] = None
    intake_month: str = Field(..., min_length=3, max_length=50)
    application_status : Literal["Pending", "Accepted", "Rejected", "Waitlisted"] = "Pending"
    offer_type:Literal ["Conditional","Unconditional"] = "Conditional"
    application_submitted:bool = False
    additional_docs_requested: bool = False
    loa_cas_received: bool = False
    loan_process_started: bool = False
    fee_payment_completed: bool = False

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
    lo: bool = False
    resumet: bool = False

class StudentCreate(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email_address: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=20)
    target_country: str = Field(..., min_length=2, max_length=50)
    assigned_counselor_id: Optional[PyObjectId] = None 
    application_path: Literal["Direct", "SI", "Eduwise"] = "Direct"
    university_choices: List[UniversityChoiceBase] = Field(..., min_length=1, max_length=5)
    documents: Optional[Documents] = None 
    visa_documents: Optional[VisaDocuments] = None


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
    
    assigned_counselor: Optional[dict] = None 
    assigned_counselor_id: Optional[PyObjectId] = None 

    created_by: Optional[dict] = None 
    created_by_id: Optional[PyObjectId] = None 

    application_path: str
    documents: Documents
    university_choices: List[UniversityChoiceBase]
    visa_documents: VisaDocuments
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3, max_length=100)
    email_address: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    target_country: Optional[str] = Field(None, min_length=2, max_length=50)
    assigned_counselor_id: Optional[PyObjectId] = None
    application_path: Optional[Literal["Direct", "SI", "Eduwise"]] = None
    visa_documents: Optional[VisaDocuments] = None
    university_choices: Optional[List[UniversityChoiceBase]] = None 
    documents: Optional[Documents] = None