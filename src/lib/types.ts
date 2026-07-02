// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  verificationToken?: string;
  verificationExpiresAt?: string;
  resetToken?: string;
  resetExpiresAt?: string;
  createdAt: string;
}

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  email_verified: 0 | 1;
  email_verified_at: string | null;
  verification_token: string | null;
  verification_expires_at: string | null;
  reset_token: string | null;
  reset_expires_at: string | null;
  created_at: string;
}

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash ?? undefined,
    googleId: row.google_id ?? undefined,
    emailVerified: row.email_verified === 1,
    emailVerifiedAt: row.email_verified_at ?? undefined,
    verificationToken: row.verification_token ?? undefined,
    verificationExpiresAt: row.verification_expires_at ?? undefined,
    resetToken: row.reset_token ?? undefined,
    resetExpiresAt: row.reset_expires_at ?? undefined,
    createdAt: row.created_at,
  };
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export type ApprovalStatus = "pending_review" | "approved" | "rejected";

export type ValidationFlag =
  | "suspicious_email"
  | "suspicious_name"
  | "weak_responses"
  | "misaligned_answers"
  | "high_compliance_risk"
  | "low_ai_fit"
  | "no_data_available";

export type TeamSize = "Solo" | "2-5" | "6-10" | "10+";

export type RepetitiveAnswer =
  | "Mostly repetitive"
  | "Mix of both"
  | "Mostly judgment calls";

export type ComplianceAnswer =
  | "No concerns"
  | "Maybe"
  | "Yes, significant concerns";

export type DataAnswer =
  | "Yes, we're organized"
  | "Somewhat, it's scattered"
  | "Not really";

export interface Submission {
  id: string;
  userId: string;
  businessType?: string;
  teamSize?: TeamSize;
  layer1Problem?: string;
  layer1Elimination?: string;
  layer2Hours?: number;
  layer2Salary?: string;
  layer3Repetitive?: RepetitiveAnswer;
  layer3Compliance?: ComplianceAnswer;
  layer3ComplianceDetail?: string;
  layer3Data?: DataAnswer;
  additionalNotes?: string;
  renderedPrompt?: string;
  submittedAt: string;
  createdAt: string;
  validationFlags: ValidationFlag[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  adminNotes?: string;
}

export interface SubmissionRow {
  id: string;
  user_id: string;
  business_type: string | null;
  team_size: string | null;
  layer1_problem: string | null;
  layer1_elimination: string | null;
  layer2_hours: number | null;
  layer2_salary: string | null;
  layer3_repetitive: string | null;
  layer3_compliance: string | null;
  layer3_compliance_detail: string | null;
  layer3_data: string | null;
  additional_notes: string | null;
  rendered_prompt: string | null;
  submitted_at: string;
  created_at: string;
  validation_flags: string;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  admin_notes: string | null;
}

export function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    userId: row.user_id,
    businessType: row.business_type ?? undefined,
    teamSize: (row.team_size as TeamSize) ?? undefined,
    layer1Problem: row.layer1_problem ?? undefined,
    layer1Elimination: row.layer1_elimination ?? undefined,
    layer2Hours: row.layer2_hours ?? undefined,
    layer2Salary: row.layer2_salary ?? undefined,
    layer3Repetitive: (row.layer3_repetitive as RepetitiveAnswer) ?? undefined,
    layer3Compliance: (row.layer3_compliance as ComplianceAnswer) ?? undefined,
    layer3ComplianceDetail: row.layer3_compliance_detail ?? undefined,
    layer3Data: (row.layer3_data as DataAnswer) ?? undefined,
    additionalNotes: row.additional_notes ?? undefined,
    renderedPrompt: row.rendered_prompt ?? undefined,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    validationFlags: JSON.parse(row.validation_flags) as ValidationFlag[],
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
  };
}

// ─── Convenience join type (used in admin dashboard) ─────────────────────────

export interface SubmissionWithUser extends Submission {
  user: Pick<User, "firstName" | "lastName" | "email">;
}
