// types/student.ts or interfaces/student.ts

export interface UniversityChoice {
  university_name: string;
  course_name: string;
  course_link?: string;
  intake_month: string;
  application_status: "Pending" | "Accepted" | "Rejected" | "Waitlisted";
  offer_type: "Conditional" | "Unconditional";
  application_submitted: boolean;
  additional_docs_requested: boolean;
  loa_cas_received: boolean;
  loan_process_started: boolean;
  fee_payment_completed: boolean;
}

export interface AssignedCounselor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreatedBy {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Documents {
  passport: boolean;
  marksheets: boolean;
  english_exam: boolean;
  sop: boolean;
  lor: boolean;
  resume: boolean;
}

export interface VisaDocuments {
  decision: "Pending" | "Approved" | "Rejected";
  counselling_started: boolean;
  documents_received: boolean;
  application_filled: boolean;
  interview_scheduled: boolean;
}

export interface StudentDetail {
  _id: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  target_country: string;
  assigned_counselor: AssignedCounselor;
  assigned_counselor_id: string | null;
  created_by: CreatedBy;
  created_by_id: string | null;
  application_path: "Direct" | "SI" | "Eduwise";
  documents: Documents;
  university_choices: UniversityChoice[];
  visa_documents: VisaDocuments;
  created_at: string;
  updated_at: string;
}

export interface StudentTableItem {
  _id: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  target_country: string;
  assigned_counselor: AssignedCounselor;
  application_path: "Direct" | "SI" | "Eduwise";
  created_at: string;
  updated_at: string;
}