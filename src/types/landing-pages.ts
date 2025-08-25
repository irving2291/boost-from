export interface LandingPage {
  id: string
  title: string
  slug: string
  htmlContent: string
  isPublished: boolean
  hasContactForm: boolean
  contactFormConfig?: ContactFormConfig
  createdAt: string
  updatedAt: string
  createdBy: string
  organizationId: string
}

export interface ContactFormConfig {
  title: string
  description?: string
  fields: ContactFormField[]
  submitButtonText: string
  successMessage: string
  redirectUrl?: string
}

export interface ContactFormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select'
  required: boolean
  placeholder?: string
  options?: string[] // For select fields
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

export interface LandingPageFormSubmission {
  id: string
  landingPageId: string
  formData: Record<string, any>
  submittedAt: string
  ipAddress?: string
  userAgent?: string
  processed: boolean
  requestId?: string // If converted to a request
}

export type LandingPageStatus = 'draft' | 'published' | 'archived'