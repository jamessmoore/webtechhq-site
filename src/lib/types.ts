export type ApprovalStatus =
  | "pending_verification"
  | "pending_review"
  | "approved"
  | "rejected";

export type ValidationFlag =
  | "suspicious_email"
  | "suspicious_name"
  | "weak_responses"
  | "misaligned_answers"
  | "high_compliance_risk"
  | "low_ai_fit"
  | "no_data_available"
  | "unverified_email";

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
  name: string;
  email: string;
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
  submittedAt: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  idpVerified: boolean;
  verificationToken?: string;
  verificationExpiresAt?: string;
  validationFlags: ValidationFlag[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  adminNotes?: string;
}

/** Row shape as stored in SQLite (snake_case, booleans as 0/1, flags as JSON string) */
export interface SubmissionRow {
  id: string;
  name: string;
  email: string;
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
  submitted_at: string;
  email_verified: 0 | 1;
  email_verified_at: string | null;
  idp_verified: 0 | 1;
  verification_token: string | null;
  verification_expires_at: string | null;
  validation_flags: string;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  admin_notes: string | null;
}

export function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
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
    submittedAt: row.submitted_at,
    emailVerified: row.email_verified === 1,
    emailVerifiedAt: row.email_verified_at ?? undefined,
    idpVerified: row.idp_verified === 1,
    verificationToken: row.verification_token ?? undefined,
    verificationExpiresAt: row.verification_expires_at ?? undefined,
    validationFlags: JSON.parse(row.validation_flags) as ValidationFlag[],
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
  };
}
