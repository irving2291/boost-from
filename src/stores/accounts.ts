import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Account, 
  AccountRequest, 
  AccountQuotation, 
  AccountConversation, 
  AccountNote, 
  AccountActivity, 
  AccountFilters, 
  AccountStats, 
  CreateAccountRequest, 
  UpdateAccountRequest,
  PaginatedResponse,
  PaginationMeta
} from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'


export const useAccountsStore = defineStore('accounts', () => {
  // State
  const accounts = ref<Account[]>([])
  const currentAccount = ref<Account | null>(null)
  const accountRequests = ref<AccountRequest[]>([])
  const accountQuotations = ref<AccountQuotation[]>([])
  const accountConversations = ref<AccountConversation[]>([])
  const accountNotes = ref<AccountNote[]>([])
  const accountActivities = ref<AccountActivity[]>([])
  const stats = ref<AccountStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const pagination = ref<PaginationMeta>({
    total: 0,
    page: 1,
    perPage: 20,
    pages: 0,
    orderBy: 'createdAt',
    direction: 'DESC'
  })

  // Filters
  const filters = ref<AccountFilters>({
    search: '',
    type: 'all',
    status: 'all',
    assignedTo: [],
    tags: [],
    priority: undefined,
    source: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    hasRequests: undefined,
    hasQuotations: undefined,
    hasConversations: undefined
  })

  // Computed
  const totalAccounts = computed(() => pagination.value.total)
  const totalClients = computed(() => stats.value?.totalClients || 0)
  const totalProspects = computed(() => stats.value?.totalProspects || 0)
  const conversionRate = computed(() => stats.value?.conversionRate || 0)

  const filteredAccounts = computed(() => {
    let filtered = [...accounts.value]
    
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(account => 
        account.firstName?.toLowerCase().includes(search) ||
        account.lastName?.toLowerCase().includes(search) ||
        account.companyName?.toLowerCase().includes(search) ||
        account.email.toLowerCase().includes(search) ||
        account.phone.includes(search)
      )
    }
    
    if (filters.value.type && filters.value.type !== 'all') {
      filtered = filtered.filter(account => account.type === filters.value.type)
    }
    
    if (filters.value.status && filters.value.status !== 'all') {
      filtered = filtered.filter(account => account.status === filters.value.status)
    }
    
    if (filters.value.priority) {
      filtered = filtered.filter(account => account.priority === filters.value.priority)
    }
    
    if (filters.value.assignedTo && filters.value.assignedTo.length > 0) {
      filtered = filtered.filter(account => 
        account.assignedTo && filters.value.assignedTo!.includes(account.assignedTo)
      )
    }
    
    if (filters.value.tags && filters.value.tags.length > 0) {
      filtered = filtered.filter(account => 
        filters.value.tags!.some(tag => account.tags.includes(tag))
      )
    }
    
    return filtered
  })

  // Actions
  const fetchAccounts = async (page = 1, perPage = 20) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      let url = `${API_ENDPOINTS.CRM.ACCOUNTS}?page=${page}&perPage=${perPage}`
      
      // Add filters to URL if they exist
      if (filters.value.search) url += `&search=${encodeURIComponent(filters.value.search)}`
      if (filters.value.type && filters.value.type !== 'all') url += `&type=${filters.value.type}`
      if (filters.value.status && filters.value.status !== 'all') url += `&status=${filters.value.status}`
      if (filters.value.priority) url += `&priority=${filters.value.priority}`
      if (filters.value.assignedTo?.length) {
        filters.value.assignedTo.forEach(assignee => url += `&assignedTo[]=${assignee}`)
      }
      
      const response = await fetch(url, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        accounts.value = data.data
        pagination.value = {
          total: data.total || 0,
          page: data.page || page,
          perPage: data.perPage || perPage,
          pages: Math.ceil((data.total || 0) / perPage),
          orderBy: 'createdAt',
          direction: 'DESC'
        }
      } else {
        console.error('Unexpected API response format for accounts:', data)
        accounts.value = []
        pagination.value = {
          total: 0,
          page: page,
          perPage: perPage,
          pages: 0,
          orderBy: 'createdAt',
          direction: 'DESC'
        }
        throw new Error('Invalid API response format')
      }
    } catch (err: any) {
      console.error('Error fetching accounts from API:', err)
      error.value = err.message || 'Error fetching accounts'
      accounts.value = []
      pagination.value = {
        total: 0,
        page: page,
        perPage: perPage,
        pages: 0,
        orderBy: 'createdAt',
        direction: 'DESC'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAccountById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${id}`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const account = await response.json()
      
      currentAccount.value = account
      return account
    } catch (err: any) {
      console.error('Error fetching account from API:', err)
      error.value = err.message || 'Error fetching account'
      currentAccount.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (accountData: CreateAccountRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}`, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify(accountData)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accounts.value.unshift(data)
      pagination.value.total += 1
      return data
    } catch (err: any) {
      error.value = err.message || 'Error creating account'
      console.error('Error creating account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (id: string, accountData: UpdateAccountRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify(accountData)
      })
      
      await handleApiError(response)
      const data = await response.json()
      const index = accounts.value.findIndex(account => account.id === id)
      if (index !== -1) {
        accounts.value[index] = data
      }
      if (currentAccount.value?.id === id) {
        currentAccount.value = data
      }
      return data
    } catch (err: any) {
      error.value = err.message || 'Error updating account'
      console.error('Error updating account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      accounts.value = accounts.value.filter(account => account.id !== id)
      pagination.value.total -= 1
      if (currentAccount.value?.id === id) {
        currentAccount.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Error deleting account'
      console.error('Error deleting account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const convertProspectToClient = async (id: string) => {
    return updateAccount(id, { status: 'client' })
  }

  // Account related data fetchers
  const fetchAccountRequests = async (accountId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/requests`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountRequests.value = Array.isArray(data) ? data : []
      return accountRequests.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching account requests'
      console.error('Error fetching account requests:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAccountQuotations = async (accountId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/quotations`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountQuotations.value = Array.isArray(data) ? data : []
      return accountQuotations.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching account quotations'
      console.error('Error fetching account quotations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAccountConversations = async (accountId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/conversations`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountConversations.value = Array.isArray(data) ? data : []
      return accountConversations.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching account conversations'
      console.error('Error fetching account conversations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAccountNotes = async (accountId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/notes`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountNotes.value = Array.isArray(data) ? data : []
      return accountNotes.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching account notes'
      console.error('Error fetching account notes:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAccountActivities = async (accountId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/activities`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountActivities.value = Array.isArray(data) ? data : []
      return accountActivities.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching account activities'
      console.error('Error fetching account activities:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addAccountNote = async (accountId: string, content: string, type: AccountNote['type'] = 'general', isPrivate = false) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/${accountId}/notes`, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify({
          content,
          type,
          isPrivate
        })
      })
      
      await handleApiError(response)
      const data = await response.json()
      accountNotes.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Error adding account note'
      console.error('Error adding account note:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACCOUNTS}/stats`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      stats.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Error fetching account stats'
      console.error('Error fetching account stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filter actions
  const setFilters = (newFilters: Partial<AccountFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      type: 'all',
      status: 'all',
      assignedTo: [],
      tags: [],
      priority: undefined,
      source: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      hasRequests: undefined,
      hasQuotations: undefined,
      hasConversations: undefined
    }
  }

  const setPagination = (newPagination: Partial<PaginationMeta>) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  // Utility functions
  const getAccountDisplayName = (account: Account) => {
    if (account.type === 'company') {
      return account.companyName || 'Unnamed Company'
    }
    return `${account.firstName || ''} ${account.lastName || ''}`.trim() || 'Unnamed Person'
  }

  const getAccountInitials = (account: Account) => {
    if (account.type === 'company') {
      return account.companyName?.charAt(0).toUpperCase() || 'C'
    }
    const first = account.firstName?.charAt(0).toUpperCase() || ''
    const last = account.lastName?.charAt(0).toUpperCase() || ''
    return first + last || 'P'
  }

  const clearCurrentAccount = () => {
    currentAccount.value = null
    accountRequests.value = []
    accountQuotations.value = []
    accountConversations.value = []
    accountNotes.value = []
    accountActivities.value = []
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    accounts,
    currentAccount,
    accountRequests,
    accountQuotations,
    accountConversations,
    accountNotes,
    accountActivities,
    stats,
    loading,
    error,
    pagination,
    filters,
    
    // Computed
    totalAccounts,
    totalClients,
    totalProspects,
    conversionRate,
    filteredAccounts,
    
    // Actions
    fetchAccounts,
    fetchAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    convertProspectToClient,
    fetchAccountRequests,
    fetchAccountQuotations,
    fetchAccountConversations,
    fetchAccountNotes,
    fetchAccountActivities,
    addAccountNote,
    fetchStats,
    setFilters,
    clearFilters,
    setPagination,
    getAccountDisplayName,
    getAccountInitials,
    clearCurrentAccount,
    clearError
  }
})