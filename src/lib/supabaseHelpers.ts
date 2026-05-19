import { supabase } from './supabase';

// Get current user's auth token for API calls
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { 'Content-Type': 'application/json' };
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

// Maps snake_case DB profile row to AppUser shape
export function mapProfileToAppUser(row: any) {
  return {
    uid: row.uid,
    email: row.email,
    fullName: row.full_name || '',
    role: row.role,
    department: row.department,
    active: row.active ?? true,
    status: row.status ?? 'active',
    phoneNumber: row.phone_number || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    address: row.address || '',
    bio: row.bio || '',
    emergencyContact: row.emergency_contact || '',
    dateOfBirth: row.date_of_birth || '',
    photoURL: row.photo_url || '',
    profileImageUrl: row.profile_image_url || '',
    studentId: row.student_id || '',
    studentCode: row.student_code || '',
    mustChangePassword: row.must_change_password ?? false,
    temporaryPassword: row.temporary_password ?? false,
    lastLogin: row.last_login || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Maps camelCase AppUser to snake_case DB row
export function mapAppUserToProfile(user: any) {
  const row: any = {};
  if (user.uid !== undefined) row.uid = user.uid;
  if (user.email !== undefined) row.email = user.email;
  if (user.fullName !== undefined) row.full_name = user.fullName;
  if (user.role !== undefined) row.role = user.role;
  if (user.department !== undefined) row.department = user.department;
  if (user.active !== undefined) row.active = user.active;
  if (user.status !== undefined) row.status = user.status;
  if (user.phoneNumber !== undefined) row.phone_number = user.phoneNumber;
  if (user.phone !== undefined) row.phone = user.phone;
  if (user.whatsapp !== undefined) row.whatsapp = user.whatsapp;
  if (user.address !== undefined) row.address = user.address;
  if (user.bio !== undefined) row.bio = user.bio;
  if (user.emergencyContact !== undefined) row.emergency_contact = user.emergencyContact;
  if (user.dateOfBirth !== undefined) row.date_of_birth = user.dateOfBirth;
  if (user.photoURL !== undefined) row.photo_url = user.photoURL;
  if (user.profileImageUrl !== undefined) row.profile_image_url = user.profileImageUrl;
  if (user.studentId !== undefined) row.student_id = user.studentId;
  if (user.studentCode !== undefined) row.student_code = user.studentCode;
  if (user.mustChangePassword !== undefined) row.must_change_password = user.mustChangePassword;
  if (user.temporaryPassword !== undefined) row.temporary_password = user.temporaryPassword;
  return row;
}

// Maps DB exam row to Exam type
export function mapExam(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    department: row.department,
    createdBy: row.created_by,
    creatorRole: row.creator_role,
    duration: row.duration,
    passingScore: row.passing_score,
    totalQuestions: row.total_questions,
    attemptsAllowed: row.attempts_allowed,
    instructions: row.instructions || '',
    active: row.active,
    status: row.status,
    published: row.published,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at
  };
}

export function mapExamToDb(exam: any) {
  const row: any = {};
  if (exam.title !== undefined) row.title = exam.title;
  if (exam.description !== undefined) row.description = exam.description;
  if (exam.department !== undefined) row.department = exam.department;
  if (exam.createdBy !== undefined) row.created_by = exam.createdBy;
  if (exam.creatorRole !== undefined) row.creator_role = exam.creatorRole;
  if (exam.duration !== undefined) row.duration = exam.duration;
  if (exam.passingScore !== undefined) row.passing_score = exam.passingScore;
  if (exam.totalQuestions !== undefined) row.total_questions = exam.totalQuestions;
  if (exam.attemptsAllowed !== undefined) row.attempts_allowed = exam.attemptsAllowed;
  if (exam.instructions !== undefined) row.instructions = exam.instructions;
  if (exam.active !== undefined) row.active = exam.active;
  if (exam.status !== undefined) row.status = exam.status;
  if (exam.published !== undefined) row.published = exam.published;
  if (exam.startDate !== undefined) row.start_date = exam.startDate;
  if (exam.endDate !== undefined) row.end_date = exam.endDate;
  return row;
}

export function mapQuestion(row: any) {
  return {
    id: row.id,
    examId: row.exam_id,
    text: row.text,
    type: row.type,
    options: row.options || [],
    correctAnswer: row.correct_answer,
    points: row.points,
    imageUrl: row.image_url || '',
    videoUrl: row.video_url || '',
    explanation: row.explanation || ''
  };
}

export function mapQuestionToDb(q: any) {
  const row: any = {};
  if (q.examId !== undefined) row.exam_id = q.examId;
  if (q.text !== undefined) row.text = q.text;
  if (q.type !== undefined) row.type = q.type;
  if (q.options !== undefined) row.options = q.options;
  if (q.correctAnswer !== undefined) row.correct_answer = q.correctAnswer;
  if (q.points !== undefined) row.points = q.points;
  if (q.imageUrl !== undefined) row.image_url = q.imageUrl;
  if (q.videoUrl !== undefined) row.video_url = q.videoUrl;
  if (q.explanation !== undefined) row.explanation = q.explanation;
  return row;
}

export function mapVideo(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    department: row.department,
    videoType: row.video_type,
    videoUrl: row.video_url,
    url: row.video_url,
    thumbnail: row.thumbnail || '',
    published: row.published,
    createdBy: row.created_by,
    professorUid: row.created_by,
    creatorName: row.creator_name || '',
    duration: row.duration || '',
    views: row.views || 0,
    materials: row.materials || [],
    createdAt: row.created_at
  };
}

export function mapVideoToDb(v: any) {
  const row: any = {};
  if (v.title !== undefined) row.title = v.title;
  if (v.description !== undefined) row.description = v.description;
  if (v.department !== undefined) row.department = v.department;
  if (v.videoType !== undefined) row.video_type = v.videoType;
  if (v.videoUrl !== undefined) row.video_url = v.videoUrl;
  if (v.thumbnail !== undefined) row.thumbnail = v.thumbnail;
  if (v.published !== undefined) row.published = v.published;
  if (v.createdBy !== undefined) row.created_by = v.createdBy;
  if (v.creatorName !== undefined) row.creator_name = v.creatorName;
  if (v.duration !== undefined) row.duration = v.duration;
  if (v.views !== undefined) row.views = v.views;
  if (v.materials !== undefined) row.materials = v.materials;
  return row;
}

export function mapHomework(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    department: row.department,
    professorUid: row.professor_uid,
    assignedBy: row.professor_uid,
    dueDate: row.due_date,
    fileUrl: row.file_url || '',
    attachmentUrl: row.file_url || '',
    maxPoints: row.max_points,
    createdAt: row.created_at
  };
}

export function mapHomeworkToDb(h: any) {
  const row: any = {};
  if (h.title !== undefined) row.title = h.title;
  if (h.description !== undefined) row.description = h.description;
  if (h.department !== undefined) row.department = h.department;
  if (h.professorUid !== undefined) row.professor_uid = h.professorUid;
  if (h.dueDate !== undefined) row.due_date = h.dueDate;
  if (h.fileUrl !== undefined) row.file_url = h.fileUrl;
  if (h.attachmentUrl !== undefined) row.file_url = h.attachmentUrl;
  if (h.maxPoints !== undefined) row.max_points = h.maxPoints;
  return row;
}

export function mapSubmission(row: any) {
  return {
    id: row.id,
    homeworkId: row.homework_id,
    studentUid: row.student_uid,
    studentName: row.student_name || '',
    studentCode: row.student_code || '',
    submissionText: row.submission_text || '',
    fileUrl: row.file_url || '',
    attachmentUrl: row.file_url || '',
    submittedAt: row.submitted_at,
    status: row.status,
    grade: row.grade,
    maxPoints: row.max_points,
    feedback: row.feedback || '',
    department: row.department || '',
    gradedAt: row.graded_at
  };
}

export function mapSubmissionToDb(s: any) {
  const row: any = {};
  if (s.homeworkId !== undefined) row.homework_id = s.homeworkId;
  if (s.studentUid !== undefined) row.student_uid = s.studentUid;
  if (s.studentName !== undefined) row.student_name = s.studentName;
  if (s.studentCode !== undefined) row.student_code = s.studentCode;
  if (s.submissionText !== undefined) row.submission_text = s.submissionText;
  if (s.fileUrl !== undefined) row.file_url = s.fileUrl;
  if (s.attachmentUrl !== undefined) row.file_url = s.attachmentUrl;
  if (s.status !== undefined) row.status = s.status;
  if (s.grade !== undefined) row.grade = s.grade;
  if (s.maxPoints !== undefined) row.max_points = s.maxPoints;
  if (s.feedback !== undefined) row.feedback = s.feedback;
  if (s.department !== undefined) row.department = s.department;
  if (s.gradedAt !== undefined) row.graded_at = s.gradedAt;
  return row;
}

export function mapCurriculum(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    department: row.department,
    thumbnail: row.thumbnail || '',
    status: row.status,
    published: row.published,
    difficulty: row.difficulty,
    duration: row.duration || '',
    assignedProfessor: row.assigned_professor,
    professorName: row.professor_name || '',
    createdBy: row.created_by,
    creatorRole: row.creator_role,
    modules: row.modules || [],
    totalLessons: row.total_lessons || 0,
    totalStudents: row.total_students || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCurriculumToDb(c: any) {
  const row: any = {};
  if (c.title !== undefined) row.title = c.title;
  if (c.description !== undefined) row.description = c.description;
  if (c.department !== undefined) row.department = c.department;
  if (c.thumbnail !== undefined) row.thumbnail = c.thumbnail;
  if (c.status !== undefined) row.status = c.status;
  if (c.published !== undefined) row.published = c.published;
  if (c.difficulty !== undefined) row.difficulty = c.difficulty;
  if (c.duration !== undefined) row.duration = c.duration;
  if (c.assignedProfessor !== undefined) row.assigned_professor = c.assignedProfessor;
  if (c.professorName !== undefined) row.professor_name = c.professorName;
  if (c.createdBy !== undefined) row.created_by = c.createdBy;
  if (c.creatorRole !== undefined) row.creator_role = c.creatorRole;
  if (c.modules !== undefined) row.modules = c.modules;
  if (c.totalLessons !== undefined) row.total_lessons = c.totalLessons;
  return row;
}

export function mapArticle(row: any) {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    description: row.description || '',
    thumbnail: row.thumbnail || '',
    coverImage: row.cover_image || '',
    authorId: row.author_id,
    authorName: row.author_name || '',
    authorRole: row.author_role || 'admin',
    published: row.published,
    status: row.status,
    category: row.category || '',
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    views: row.views || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapArticleToDb(a: any) {
  const row: any = {};
  if (a.title !== undefined) row.title = a.title;
  if (a.excerpt !== undefined) row.excerpt = a.excerpt;
  if (a.content !== undefined) row.content = a.content;
  if (a.description !== undefined) row.description = a.description;
  if (a.thumbnail !== undefined) row.thumbnail = a.thumbnail;
  if (a.coverImage !== undefined) row.cover_image = a.coverImage;
  if (a.authorId !== undefined) row.author_id = a.authorId;
  if (a.authorName !== undefined) row.author_name = a.authorName;
  if (a.authorRole !== undefined) row.author_role = a.authorRole;
  if (a.published !== undefined) row.published = a.published;
  if (a.status !== undefined) row.status = a.status;
  if (a.category !== undefined) row.category = a.category;
  if (a.likesCount !== undefined) row.likes_count = a.likesCount;
  if (a.commentsCount !== undefined) row.comments_count = a.commentsCount;
  return row;
}

export function mapAttendance(row: any) {
  return {
    id: row.id,
    studentUid: row.student_uid,
    studentId: row.student_id || '',
    professorUid: row.professor_uid,
    department: row.department,
    status: row.status,
    date: row.date,
    createdAt: row.created_at
  };
}

export function mapAttendanceToDb(a: any) {
  const row: any = {};
  if (a.studentUid !== undefined) row.student_uid = a.studentUid;
  if (a.studentId !== undefined) row.student_id = a.studentId;
  if (a.professorUid !== undefined) row.professor_uid = a.professorUid;
  if (a.department !== undefined) row.department = a.department;
  if (a.status !== undefined) row.status = a.status;
  if (a.date !== undefined) row.date = a.date;
  return row;
}

export function mapCertificate(row: any) {
  return {
    id: row.id,
    certificateCode: row.certificate_code,
    studentUid: row.student_uid,
    studentName: row.student_name || '',
    studentId: row.student_id || '',
    department: row.department,
    examId: row.exam_id,
    examTitle: row.exam_title || '',
    score: row.score,
    issuedBy: row.issued_by || 'System',
    issueDate: row.issue_date,
    verificationUrl: row.verification_url || '',
    pdfUrl: row.pdf_url || '',
    status: row.status
  };
}

export function mapBadge(row: any) {
  return {
    id: row.id,
    badgeCode: row.badge_code,
    studentUid: row.student_uid,
    studentId: row.student_id || '',
    studentName: row.student_name || '',
    department: row.department || '',
    active: row.active,
    verificationUrl: row.verification_url || '',
    createdAt: row.created_at
  };
}

export function mapPayment(row: any) {
  return {
    id: row.id,
    studentUid: row.student_uid,
    studentId: row.student_id || '',
    fullName: row.full_name || '',
    department: row.department || '',
    paymentType: row.payment_type,
    month: row.month || '',
    installment: row.installment || '',
    amount: row.amount,
    status: row.status,
    validatedBy: row.validated_by,
    receiptCode: row.receipt_code || '',
    createdAt: row.created_at
  };
}

export function mapNotification(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at
  };
}

export function mapServiceRequest(row: any) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    service: row.service,
    details: row.details || '',
    appointmentDate: row.appointment_date,
    documentUrl: row.document_url || '',
    status: row.status,
    createdAt: row.created_at
  };
}
