export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CourseApplicationProgress {
  offerType?: 'conditional' | 'unconditional';
  loanProcessStarted?: boolean;
  additionalDocsRequested?: boolean;
  feePaymentCompleted?: boolean;
  loaCasReceived?: boolean;
  applicationSubmitted?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
}

export interface Course {
  id: string;
  universityName: string;
  courseName: string;
  courseLink: string;
  intakeMonth: string;
  priority: number;
  applicationProgress?: CourseApplicationProgress;
}

export interface DocumentStatus {
  passport: boolean;
  marksheets: boolean;
  englishProficiency: boolean;
  sop: boolean;
  lors: boolean;
  resume: boolean;
}

export interface ApplicationProgress {
  path: 'SI' | 'Eduwise';
}

export interface VisaProgress {
  counsellingStarted: boolean;
  documentsReceived: boolean;
  applicationFiled: boolean;
  interviewScheduled: boolean;
  decision: 'approved' | 'rejected' | 'pending';
  departureTracking: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  counselor?: string;
  country: string;
  courses: Course[];
  applicationPath: 'SI' | 'Eduwise';
  currentStage: 'document' | 'application' | 'visa' | 'departed';
  documents: DocumentStatus;
  applicationProgress: ApplicationProgress;
  visaProgress: VisaProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalStudents: number;
  documentStage: number;
  applicationStage: number;
  visaStage: number;
  departed: number;
  siApplications: number;
  eduwiseApplications: number;
}

export interface RecentActivity {
  id: string;
  studentName: string;
  action: string;
  timestamp: Date;
  type: 'document' | 'application' | 'visa' | 'general';
}
