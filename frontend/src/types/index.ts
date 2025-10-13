export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  department?: string
  position?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: string
  department?: string
  position?: string
  phone?: string
}

export interface LicenseRequest {
  id: string
  requestNumber: string
  userId: string
  user?: User
  licenseType: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
  title: string
  description: string
  requestDate: string
  submittedDate?: string
  approvedDate?: string
  rejectedDate?: string
  deadlineDate?: string
  assignedInspectorId?: string
  assignedInspector?: User
  notes?: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Inspection {
  id: string
  licenseRequestId: string
  licenseRequest?: LicenseRequest
  inspectorId: string
  inspector?: User
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: string
  completedDate?: string
  location: string
  findings?: string
  recommendations?: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface AuditReport {
  id: string
  inspectionId: string
  inspection?: Inspection
  reporterId: string
  reporter?: User
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  title: string
  content: string
  submittedDate?: string
  reviewedDate?: string
  approvedDate?: string
  rejectedDate?: string
  reviewerId?: string
  reviewer?: User
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  user?: User
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface Attachment {
  id: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  filePath: string
  uploadedBy: string
  uploadedByUser?: User
  createdAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface LicenseRequestFilters extends PaginationParams {
  status?: string
  licenseType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
}

export interface InspectionFilters extends PaginationParams {
  status?: string
  inspectorId?: string
  dateFrom?: string
  dateTo?: string
}

export interface AuditReportFilters extends PaginationParams {
  status?: string
  reporterId?: string
  dateFrom?: string
  dateTo?: string
}

export interface NotificationFilters extends PaginationParams {
  isRead?: boolean
  type?: string
  priority?: string
}