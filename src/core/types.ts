// Button types
export type ButtonType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
  busy?: boolean
  disabled?: boolean
  outline?: boolean
  block?: boolean
  className?: string
}

// Modal types
export interface ModalProps {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

// Dropdown types
export interface DropdownItem {
  label: string
  value: any
  icon?: string
  disabled?: boolean
  divider?: boolean
}

export interface DropdownProps {
  items: DropdownItem[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  multiple?: boolean
  className?: string
}

// Input types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

export interface InputProps {
  type?: InputType
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  label?: string
  helpText?: string
  className?: string
}

// Card types
export interface CardProps {
  title?: string
  subtitle?: string
  shadow?: boolean
  border?: boolean
  hover?: boolean
  className?: string
}

// List types
export interface ListItem {
  id: string | number
  title: string
  subtitle?: string
  description?: string
  avatar?: string
  icon?: string
  badge?: string
  actions?: Array<{
    label: string
    icon?: string
    action: () => void
  }>
}

export interface ListViewProps {
  items: ListItem[]
  loading?: boolean
  empty?: string
  className?: string
}

export interface ListTileProps {
  item: ListItem
  clickable?: boolean
  className?: string
}

// Theme types
export type Theme = 'light' | 'dark'

export interface ThemeConfig {
  theme: Theme
  colors: {
    primary: string
    secondary: string
    success: string
    danger: string
    warning: string
    info: string
    light: string
    dark: string
  }
}