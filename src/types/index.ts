export type CourseType = 'Auto École' | 'Informatique' | 'Technique Informatique';
export type UserRole = 'admin' | 'professor' | 'student' | 'super_admin';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late'
}

export interface UserBase {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  department: CourseType;
  active: boolean;
  status: UserStatus;
  createdAt: any;
  updatedAt?: any;
  lastLogin?: any;
  profileImageUrl?: string;
  mustChangePassword?: boolean;
}

export interface Student extends UserBase {
  studentId: string; // The generated code like WA-INFO-2026-0001
  role: 'student';
  phone?: string; // mapping to phoneNumber for legacy
  whatsapp?: string;
  address?: string;
  bio?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  photoURL?: string; // mapping to profileImageUrl for legacy
  // Legacy support for some older components
  course?: CourseType;
  studentCode?: string;
}

export interface Professor extends UserBase {
  role: 'professor';
  whatsapp?: string;
  temporaryPassword?: boolean;
}

export interface Admin extends UserBase {
  role: 'admin';
}

export interface SuperAdmin extends UserBase {
  role: 'super_admin';
}

export type AppUser = Student | Professor | Admin | SuperAdmin;

export interface Payment {
  id: string;
  studentId: string;
  studentCode: string;
  amount: number;
  paymentType: 'Registration' | 'Installment' | 'Full';
  paymentDate: any;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  remainingBalance: number;
}

export const COURSE_PRICING: Record<CourseType, { registration: number, total: number, installments: number, installmentAmount: number }> = {
  'Auto École': {
    registration: 2000,
    total: 9000,
    installments: 2,
    installmentAmount: 3500
  },
  'Informatique': {
    registration: 2000,
    total: 10000,
    installments: 4,
    installmentAmount: 2000
  },
  'Technique Informatique': {
    registration: 2000,
    total: 10000,
    installments: 4,
    installmentAmount: 2000
  }
};

export interface Exam {
  id: string;
  title: string;
  description?: string;
  department: CourseType;
  // Legacy support
  courseId?: string;
  createdBy: string;
  creatorRole: 'admin' | 'professor';
  duration: number; // in minutes
  passingScore: number;
  totalQuestions: number;
  attemptsAllowed?: number;
  instructions?: string;
  active: boolean;
  status?: string;
  published?: boolean;
  startDate?: any;
  endDate?: any;
  createdAt: any;
}

export interface Question {
  id: string;
  examId: string;
  // Unified question field names
  text: string;
  type: 'mcq' | 'boolean' | 'short' | 'identification' | 'checkbox';
  options: string[];
  correctAnswer: string;
  points: number;
  imageUrl?: string;
  videoUrl?: string;
  explanation?: string;
  // Legacy compatibility
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
}

export interface Attendance {
  id: string;
  studentUid: string;
  studentId?: string;
  professorUid: string;
  department: string;
  status: 'present' | 'absent' | 'late';
  date: any;
  createdAt: any;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  department: CourseType;
  professorUid: string;
  assignedBy?: string; // professor uid
  dueDate: any;
  fileUrl?: string; // Standard file field
  attachmentUrl?: string; // Legacy compatibility
  maxPoints?: number;
  createdAt: any;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentUid: string;
  studentName: string;
  studentCode: string;
  submissionText?: string;
  fileUrl?: string;
  attachmentUrl?: string; // Legacy/Migration compatibility
  submittedAt: any;
  status: 'submitted' | 'pending' | 'graded' | 'late' | 'resubmitted';
  grade?: number;
  maxPoints?: number;
  feedback?: string;
  department?: CourseType;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  department: CourseType;
  videoType: 'youtube' | 'vimeo' | 'storage' | 'url';
  videoUrl: string;
  url?: string; // Legacy/Migration compatibility
  thumbnail?: string;
  published: boolean;
  createdBy: string; // professor/admin uid
  professorUid?: string; // Compatibility
  creatorName?: string;
  duration?: string;
  views?: number;
  materials?: { name: string; url: string }[];
  createdAt: any;
}

export interface VideoProgress {
  id: string;
  studentUid: string;
  videoId: string;
  progress: number; // percentage
  completed: boolean;
  lastUpdated: any;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'professor' | 'admin';
  content: string;
  createdAt: any;
}

export interface Article {
  id: string;
  title: string;
  excerpt?: string; // Added
  content: string;
  description: string;
  thumbnail: string;
  coverImage?: string; // Compatibility
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'professor';
  published: boolean;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  updatedAt?: any; // Ensure it's optional if missing
  views?: number;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  userId?: string;
  userName: string;
  content: string;
  createdAt: any;
}

export interface ArticleLike {
  id: string;
  articleId: string;
  userId: string;
  createdAt: any;
}

export interface ServiceRequest {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  service: string;
  details: string;
  appointmentDate: any;
  documentUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentCode: string;
  examId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: any;
  answers: Record<string, string>;
  attempt: number;
  teacherComments?: string;
}

export interface AssignedExam {
  id: string;
  examId: string;
  assignedTo: string | 'all' | string[]; 
  department: CourseType;
  assignedBy: string; // professor uid
  active: boolean;
  dueDate?: any;
  attemptsAllowed?: number;
  createdAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'exam' | 'homework' | 'attendance' | 'system' | 'certificate';
  read: boolean;
  createdAt: any;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  studentUid: string;
  studentName: string;
  studentId: string;
  department: CourseType;
  examId?: string;
  examTitle: string;
  score: number;
  issuedBy: 'System' | 'Admin';
  issueDate: any;
  verificationUrl: string;
  pdfUrl?: string;
  status: 'active' | 'revoked';
}

export interface OldCertificate {
  id: string;
  certificateCode: string;
  studentName: string;
  pdfUrl: string;
  verified: boolean;
  issueDate: any;
  department?: string;
}

export interface Badge {
  id: string;
  studentUid: string;
  badgeCode: string;
  studentId: string;
  studentName: string;
  department: string;
  active: boolean;
  createdAt: any;
  verificationUrl?: string;
}

export type PaymentType = 'registration' | 'monthly' | 'installment';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface FinancialSettings {
  informatique: {
    registrationFee: number;
    monthlyFee: number;
  };
  techniqueInfo: {
    registrationFee: number;
    monthlyFee: number;
  };
  autoEcole: {
    registrationFee: number;
    installment1: number;
    installment2: number;
    total: number;
  };
}

export interface StudentPayment {
  id: string;
  studentUid: string;
  studentId: string;
  fullName: string;
  department: string;
  paymentType: PaymentType;
  month?: string;
  installment?: string;
  amount: number;
  status: 'paid';
  validatedBy: string;
  createdAt: any;
  receiptCode?: string;
}

export interface Receipt {
  id: string;
  receiptCode: string;
  studentUid: string;
  studentId: string;
  fullName: string;
  department: string;
  paymentId: string;
  paymentType: string;
  description: string;
  amount: number;
  remainingBalance?: number;
  generatedAt: any;
  validatedBy: string;
}

export interface SystemGeneralSettings {
  academyName: string;
  academyDescription: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  schoolAddress: string;
  timezone: string;
  defaultLanguage: string;
}

export interface SystemBrandingSettings {
  schoolLogo: string;
  favicon: string;
  landingPageBanner: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface SystemCertificateSettings {
  passingPercentage: number;
  automaticGeneration: boolean;
  backgroundUrl: string;
  signatures: { title: string; name: string; signatureUrl: string }[];
  verificationUrl: string;
}

export interface SystemBadgeSettings {
  enabled: boolean;
  layout: 'standard' | 'mini' | 'detailed';
  templateUrl: string;
  showQR: boolean;
  expirationMonths: number;
}

export interface SystemExamSettings {
  maxAttempts: number;
  defaultTimer: number;
  shuffleQuestions: boolean;
  negativeMarking: boolean;
  passingScore: number;
  autoSubmit: boolean;
  showReview: boolean;
}

export interface SystemStudentSettings {
  registrationOpen: boolean;
  profileImageRequired: boolean;
  autoGenerateId: boolean;
  idPrefix: string;
}

export interface SystemAuthSettings {
  googleLoginEnabled: boolean;
  emailPasswordLoginEnabled: boolean;
  studentIdLoginEnabled: boolean;
  sessionTimeout: number;
  rememberMeEnabled: boolean;
  autoLogoutTimer: number;
  twoFactorEnabled: boolean;
  deviceTracking: boolean;
  passwordRules: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase?: boolean;
  };
}

export interface SystemNotificationSettings {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  paymentReminders: boolean;
  certificateAlerts: boolean;
  examReminders: boolean;
  templates?: Record<string, string>;
}

export interface SystemSecuritySettings {
  failedLoginLimit: number;
  lockoutDuration: number;
  sessionDuration: number;
  deviceManagement: boolean;
  accessLogs: boolean;
  ipWhitelist?: string[];
  geoRestriction?: boolean;
  suspiciousLoginDetection?: boolean;
}

export interface SystemMultiservicesSettings {
  enabled: boolean;
  contactPhones: string[];
  whatsappNumber: string;
  availableServices: {
    id: string;
    name: string;
    price: number;
    description: string;
    enabled: boolean;
    category: string;
  }[];
  availabilityMessage: string;
}

export interface SystemMaintenanceSettings {
  enabled: boolean;
  message: string;
  estimatedReturn?: any;
  allowAdminBypass: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'storage';
  resources?: { name: string; url: string }[];
  homeworkId?: string;
  examId?: string;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  department: CourseType;
  thumbnail?: string;
  status: 'published' | 'draft' | 'archived';
  published: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration?: string;
  assignedProfessor?: string;
  professorName?: string;
  createdBy: string;
  creatorRole: 'admin' | 'professor';
  createdAt: any;
  updatedAt: any;
  modules?: Module[];
  totalLessons: number;
  totalStudents?: number;
}

export interface SystemBackupInfo {
  id: string;
  type: 'full' | 'settings' | 'users' | 'exams';
  timestamp: any;
  size: number;
  url: string;
  createdBy: string;
}
