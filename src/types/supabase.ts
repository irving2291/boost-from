export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          city: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone?: string | null
          city?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          city?: string | null
        }
      }
      customers_email: {
        Row: {
          id: string
          value: string
          registered_at: string
          customers_id: string
        }
        Insert: {
          id?: string
          value: string
          registered_at: string
          customers_id: string
        }
        Update: {
          id?: string
          value?: string
          registered_at?: string
          customers_id?: string
        }
      }
      events: {
        Row: {
          id: string
          decription: string | null
          entity_type: string
          entity_id: string
          author_id: string
          created_at: string
        }
        Insert: {
          id?: string
          decription?: string | null
          entity_type: string
          entity_id: string
          author_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          decription?: string | null
          entity_type?: string
          entity_id?: string
          author_id?: string
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          logo_path: string | null
          created_at: string | null
          updated_at: string | null
          description: string | null
          active: boolean
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          logo_path?: string | null
          created_at?: string | null
          updated_at?: string | null
          description?: string | null
          active?: boolean
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          logo_path?: string | null
          created_at?: string | null
          updated_at?: string | null
          description?: string | null
          active?: boolean
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          organization_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          created_at?: string | null
        }
      }
      quotations: {
        Row: {
          id: string
          details: any | null
          request_information_id: string | null
          status_id: string
          organization_id: string | null
          created_at: string
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          details?: any | null
          request_information_id?: string | null
          status_id: string
          organization_id?: string | null
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          details?: any | null
          request_information_id?: string | null
          status_id?: string
          organization_id?: string | null
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      request_information: {
        Row: {
          id: string
          organization_id: string
          status_id: string
          program_interest_id: string
          lead_origin_id: string | null
          last_user_updated: any | null
          comments: string | null
          first_name: string
          last_name: string | null
          email: string
          phone: string | null
          city: string | null
          updated_at: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          status_id: string
          program_interest_id: string
          lead_origin_id?: string | null
          last_user_updated?: any | null
          comments?: string | null
          first_name: string
          last_name?: string | null
          email: string
          phone?: string | null
          city?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          status_id?: string
          program_interest_id?: string
          lead_origin_id?: string | null
          last_user_updated?: any | null
          comments?: string | null
          first_name?: string
          last_name?: string | null
          email?: string
          phone?: string | null
          city?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
      }
      states: {
        Row: {
          id: string
          organization_id: string
          entity_type: string | null
          entity_id: string | null
          code: string
          name: string | null
          default: boolean
          sort: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          entity_type?: string | null
          entity_id?: string | null
          code: string
          name?: string | null
          default?: boolean
          sort?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          entity_type?: string | null
          entity_id?: string | null
          code?: string
          name?: string | null
          default?: boolean
          sort?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerEmail = Database['public']['Tables']['customers_email']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Quotation = Database['public']['Tables']['quotations']['Row']
export type RequestInformation = Database['public']['Tables']['request_information']['Row']
export type State = Database['public']['Tables']['states']['Row']

// Insert types
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerEmailInsert = Database['public']['Tables']['customers_email']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type QuotationInsert = Database['public']['Tables']['quotations']['Insert']
export type RequestInformationInsert = Database['public']['Tables']['request_information']['Insert']
export type StateInsert = Database['public']['Tables']['states']['Insert']

// Update types
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type CustomerEmailUpdate = Database['public']['Tables']['customers_email']['Update']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type QuotationUpdate = Database['public']['Tables']['quotations']['Update']
export type RequestInformationUpdate = Database['public']['Tables']['request_information']['Update']
export type StateUpdate = Database['public']['Tables']['states']['Update']