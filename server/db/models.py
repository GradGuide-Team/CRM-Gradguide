# server\db\models.py
from mongoengine import Document, StringField, EmbeddedDocument, ListField, EmbeddedDocumentField, ReferenceField, BooleanField, DateTimeField, IntField
from datetime import datetime, timezone 
class User(Document):
    name = StringField(required=True)
    email = StringField(required = True, unique=True)
    hashed_password = StringField(required=True)
    role = StringField(default = "member", choices = ["member", "admin"])

# Its job is to take the data from a User object (which comes from your MongoDB database)
# and put it into a standard Python dictionary.
    def to_public_dict(self):
        return{
            "id":str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role
        }
    
class ApplicationStatusLog(EmbeddedDocument):
    """Logs for tracking application status changes"""
    previous_status = StringField()
    new_status = StringField(required=True)
    timestamp = DateTimeField(default=datetime.now(timezone.utc))
    changed_by = ReferenceField(User, required=True)
    university_choice_index = IntField(required=True) 

    def to_dict(self):
        return {
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "changed_by": self.changed_by.to_public_dict() if self.changed_by else None,
            "university_choice_index": self.university_choice_index
        }
    
class UniversityNote(EmbeddedDocument):
    """Notes specific to each university choice"""
    title = StringField() 
    description = StringField() 
    created_by = ReferenceField(User, required=True)
    created_at = DateTimeField(default=datetime.now(timezone.utc))
    updated_at = DateTimeField(default=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "created_by": self.created_by.to_public_dict() if self.created_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class UniversityChoice(EmbeddedDocument):
    university_name = StringField(required=True)
    course_name = StringField(required = True)
    course_link = StringField()
    intake_month = StringField(required = True)
    application_status = StringField(defalut = "documents pending", choices = [
            "documents pending", 
            "documents received", 
            "application pending", 
            "application filed", 
            "conditional offer received", 
            "unconditional offer received", 
            "Uni finalized"
        ])
    offer_type = StringField(default = "Conditional",choices=["Conditional", "Unconditional"])
    application_submitted = BooleanField(default=False)
    additional_docs_requested = BooleanField(default=False)
    loa_cas_received = BooleanField(default=False)
    loan_process_started = BooleanField(default=False)
    fee_payment_completed = BooleanField(default=False)
    notes = ListField(EmbeddedDocumentField(UniversityNote))
    
    def to_dict(self):
        data = self.to_mongo().to_dict() if hasattr(self.to_mongo(),'to_dict') else dict(self.to_mongo())
        if self.notes:
            data['notes'] = [note.to_dict() for note in self.notes]
        else:
            data['notes'] = []
        return data

class OverviewNote(EmbeddedDocument):
    """Overview notes for the student - both manual and automatic"""
    type = StringField(required=True, choices=["manual", "automatic"])
    title = StringField()  
    content = StringField()  
    created_by = ReferenceField(User, required=True)
    created_at = DateTimeField(default=datetime.now(timezone.utc))
    related_university_index = IntField() 

    def to_dict(self):
        return {
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "created_by": self.created_by.to_public_dict() if self.created_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "related_university_index": self.related_university_index
        }

class DocumentsRequired(EmbeddedDocument):
    passport = BooleanField(default=False)
    marksheets = BooleanField(default=False)
    english_exam = BooleanField(default=False)
    sop = BooleanField(default=False)
    lor = BooleanField(default=False)
    resume = BooleanField(default=False)

class VisaDocuments(EmbeddedDocument):
    decision = StringField(default = "Pending", choices = ["Pending", "Accepted", "Rejected"])
    counselling_started = BooleanField(default=False)
    documents_received = BooleanField(default=False)
    application_filled = BooleanField(default=False)
    interview_scheduled = BooleanField(default=False)

class SchoolMarksheet(EmbeddedDocument):
    x_year = StringField(required = True)
    x_school_name = StringField(required = True)
    x_cgpa = StringField(required = True)
    xii_year = StringField(required = True)
    xii_school_name = StringField(required = True)
    xii_cgpa = StringField(required = True)
    xii_english = StringField(required = True)
    xii_maths = StringField()
    xii_stream = StringField(required = True)
    
class UniversityMarksheet(EmbeddedDocument):
    semester = StringField()
    cgpa = IntField()
    backlog = IntField()
    year = StringField()
    
class SemesterResult(EmbeddedDocument):
    semester = StringField()
    year = StringField()
    cgpa = StringField()
    grade = StringField()
    kt = StringField()

class UniversityDetails(EmbeddedDocument):
    college_name = StringField()
    branch_name = StringField()
    stream = StringField()
    university_name = StringField()
    degree_earned = StringField()
    start_year = StringField()
    end_year = StringField()
    semesters = ListField(EmbeddedDocumentField(SemesterResult))
    overall_cgpa = StringField()
    final_grade = StringField()
    total_kt = StringField()
    
class Student(Document):
    full_name = StringField(required = True)
    email_address = StringField(required = True)
    phone_number = StringField(required = True)
    target_country = StringField(required = True)
    school_marksheet = EmbeddedDocumentField(SchoolMarksheet)
    dob = DateTimeField(required=True)
    parents_contact = StringField()
    parents_email = StringField()
    assigned_counselor = ReferenceField(User)
    created_by = ReferenceField(User, required = True)
    degree_type = StringField(choices = ["Undergraduation","Masters","PHD"])
    application_path = StringField(required = True)
    university_details = EmbeddedDocumentField(UniversityDetails)
    university_marksheet = ListField(EmbeddedDocumentField(UniversityMarksheet))
    university_choices = ListField(EmbeddedDocumentField(UniversityChoice))
    documents = EmbeddedDocumentField(DocumentsRequired, default=DocumentsRequired)
    visa_documents = EmbeddedDocumentField(VisaDocuments, default = VisaDocuments)
    status_logs = ListField(EmbeddedDocumentField(ApplicationStatusLog))
    overview_notes = ListField(EmbeddedDocumentField(OverviewNote))

    created_at = StringField(default=lambda: datetime.now(timezone.utc).isoformat()) 
    updated_at = StringField(default=lambda: datetime.now(timezone.utc).isoformat()) 

    meta = {'collection': 'students'}
    # MongoEngine Document objects are powerful but not directly usable by FastAPI's Pydantic
    # schemas or for sending as JSON responses. Pydantic needs plain Python dictionaries (or objects it understands, 
    # like BaseModel instances).

    # This method is your custom way of formatting the data exactly how you want it to appear
    # in the API response.

    def to_public_dict(self):
        data = {
            "id" : str(self.id),
            "full_name": self.full_name,
            "email_address": self.email_address,  
            "phone_number": self.phone_number,
            "dob":self.dob,
            "target_country": self.target_country,
            "parents_contact": self.parents_contact,
            "parents_email": self.parents_email,
            "application_path": self.application_path,
            "degree_type":self.degree_type,
            "university_choices": [choice.to_dict() for choice in self.university_choices],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self.school_marksheet:
            data["school_marksheet"] = self.school_marksheet.to_mongo().to_dict()
        else:
            data["school_marksheet"] = None
            
        if self.university_details:
            data["university_details"] = self.university_details.to_mongo().to_dict()
        else:
            data["university_details"] = None
            
        # Handle university_marksheet (optional, list of objects)
        if self.university_marksheet:
            data["university_marksheet"] = [marksheet.to_mongo().to_dict() for marksheet in self.university_marksheet]
        else:
            data["university_marksheet"] = []
        # Handle assigned counselor
        if self.assigned_counselor:
            if isinstance(self.assigned_counselor, User):
                data["assigned_counselor"] = self.assigned_counselor.to_public_dict()
            else:
                data["assigned_counselor_id"] = str(self.assigned_counselor.id)
        else:
            data["assigned_counselor"] = None
            

        # Handle created by
        if self.created_by:
            if isinstance(self.created_by, User):
                data["created_by"] = self.created_by.to_public_dict()
            else:
                data["created_by_id"] = str(self.created_by.id)
        else:
            data["created_by"] = None

        if self.documents:
            data["documents"] = self.documents.to_mongo().to_dict()
        else:
            data["documents"] = DocumentsRequired().to_mongo().to_dict()

        if self.visa_documents:
            data["visa_documents"] = self.visa_documents.to_mongo().to_dict()
        else:
            data["visa_documents"] = VisaDocuments().to_mongo().to_dict()

        if self.status_logs:
            data["status_logs"] = [log.to_dict() for log in self.status_logs]
        else:
            data["status_logs"] = []

        if self.overview_notes:
            data["overview_notes"] = [note.to_dict() for note in self.overview_notes]
        else:
            data["overview_notes"] = []

        return data