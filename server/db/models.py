# server\db\models.py
from mongoengine import Document, StringField, EmbeddedDocument, ListField, EmbeddedDocumentField, ReferenceField, BooleanField
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
    
class UniversityChoice(EmbeddedDocument):
    university_name = StringField(required=True)
    course_name = StringField(required = True)
    course_link = StringField()
    intake_month = StringField(required = True)
    application_status = StringField(default="Pending", choices = ["Pending", "Accepted", "Rejected", "Waitlisted"])
    offer_type = StringField(default = "Conditional",choices=["Conditional", "Unconditional"])
    application_submitted = BooleanField(default=False)
    additional_docs_requested = BooleanField(default=False)
    loa_cas_received = BooleanField(default=False)
    loan_process_started = BooleanField(default=False)
    fee_payment_completed = BooleanField(default=False)

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


class Student(Document):
    full_name = StringField(required = True)
    email_address = StringField(required = True)
    phone_number = StringField(required = True)
    target_country = StringField(required = True)

    assigned_counselor = ReferenceField(User)
    created_by = ReferenceField(User, required = True)

    application_path = StringField(required = True)
    university_choices = ListField(EmbeddedDocumentField(UniversityChoice))
    documents = EmbeddedDocumentField(DocumentsRequired, default=DocumentsRequired)
    visa_documents = EmbeddedDocumentField(VisaDocuments, default = VisaDocuments)

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
            "target_country": self.target_country,
            "application_path": self.application_path,
            "university_choices": [choice.to_mongo().to_dict() if hasattr(choice.to_mongo(), 'to_dict') else dict(choice.to_mongo()) for choice in self.university_choices],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

        if self.assigned_counselor:
            if isinstance(self.assigned_counselor, User):
                data["assigned_counselor"] = self.assigned_counselor.to_public_dict()
            else:
                data["assigned_counselor_id"] = str(self.assigned_counselor.id)
        else:
            data["assigned_counselor"] = None

        if self.created_by:
            if isinstance(self.created_by, User):
                data["created_by"] = self.created_by.to_public_dict()
            else:
                data["created_by_id"] = str(self.created_by.id)
        else:
            data["created_by"] = None # Should not happen if required=True
        
        if self.documents:
            data["documents"] = self.documents.to_mongo().to_dict()
        else:
            data["documents"] = DocumentsRequired().to_mongo().to_dict()

        if self.visa_documents:
            data["visa_documents"] = self.visa_documents.to_mongo().to_dict()
        else:
            data["visa_documents"] = VisaDocuments().to_mongo().to_dict()

        return data