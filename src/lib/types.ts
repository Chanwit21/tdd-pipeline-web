export type Role = "MANAGER" | "ADMIN";

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  departmentId: number | null;
  departmentCode: string | null;
  departmentName: string | null;
}

export interface FieldError {
  field: string | null;
  code: string;
  message: string;
}

export interface MasterConfig {
  departments: { id: number; code: string; name: string; defaultOwner: string }[];
  dealTypes: string[];
  dealStatuses: string[];
  dealStages: { id: number; name: string; allowedFor: string[] }[];
  typeOptions: { id: number; name: string }[];
  statusOptions: { id: number; name: string }[];
  probabilities: { probability: string; situation: string }[];
  rules: { wonProbability: string; poProbability: string };
}

export interface Deal {
  id: number;
  recordId: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  dealOwner: string;
  customer: string;
  dealName: string;
  dealType: string;
  dealStatus: string;
  dealStage: string;
  probability: string;
  situation: string;
  closedDate: string; // yyyy-MM
  amount: number;
  projectCode: string | null;
  costSheetNo: string | null;
  createdDate: string; // yyyy-MM-dd
  legacyMigrated: boolean;
  migrationRemark: string | null;
  overdue: boolean;
  rowColor: "success" | "slate" | "danger" | "normal";
  createdAt: string;
  updatedAt: string;
  notes: DealNote[];
  history: DealHistoryEntry[];
}

export interface DealNote {
  id: number;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface DealHistoryEntry {
  id: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedByName: string;
  changedAt: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DealFormValues {
  departmentId: number | null;
  customer: string;
  dealName: string;
  dealType: string;
  dealStatus: string;
  dealStage: string;
  probability: string;
  closedDate: string; // yyyy-MM
  amount: string;
  projectCode: string;
  costSheetNo: string;
  createdDate: string; // yyyy-MM-dd
}

export interface PivotReport {
  rowHeader: string;
  columns: string[];
  rows: { label: string; values: Record<string, number>; total: number }[];
  columnTotals: Record<string, number>;
  grandTotal: number;
}

export interface AdminUser {
  lastLoginAt: string | null;
  id: number;
  username: string;
  fullName: string;
  role: Role;
  departmentId: number | null;
  departmentCode: string | null;
  active: boolean;
}
