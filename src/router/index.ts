import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TestPage from '../pages/TestPage.vue'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => TestPage
  },
  {
    path: '/test-drag-drop',
    name: 'TestDragDrop',
    component: () => import('../pages/TestDragDropPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/test-kanban',
    name: 'TestKanban',
    component: () => import('../pages/TestKanbanPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/test-dashboard',
    name: 'TestDashboard',
    component: () => import('../pages/TestDashboardPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/requests',
    name: 'Requests',
    component: () => import('../pages/RequestsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quotations',
    name: 'Quotations',
    component: () => import('../pages/QuotationsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../pages/AnalyticsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/assignees',
    name: 'Assignees',
    component: () => import('../pages/AssigneesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/organizations',
    meta: { requiresAuth: true, requiresRole: ['admin', 'super-admin'] }
  },
  {
    path: '/admin/organizations',
    name: 'AdminOrganizations',
    component: () => import('../pages/admin/OrganizationsPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'super-admin'] }
  },
  {
    path: '/admin/organizations/:id',
    name: 'AdminOrganizationEdit',
    component: () => import('../pages/admin/OrganizationEditPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'super-admin'] }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../pages/admin/UsersPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'super-admin'] }
  },
  {
    path: '/admin/roles-permissions',
    name: 'AdminRolesPermissions',
    component: () => import('../pages/admin/RolesPermissionsPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'super-admin'] }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../pages/ChatPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:conversationId',
    name: 'ChatConversation',
    component: () => import('../pages/ChatPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('../pages/AccountsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/new',
    name: 'AccountCreate',
    component: () => import('../pages/AccountCreatePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/:id',
    name: 'AccountDetails',
    component: () => import('../pages/AccountDetailsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts/:id/edit',
    name: 'AccountEdit',
    component: () => import('../pages/AccountEditPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to:any, _:any, next:any) => {
  const authStore = useAuthStore()
  
  // Initialize auth state if not already done
  if (!authStore.user && !authStore.token) {
    authStore.initializeAuth()
  }

  const requiresAuth = to.matched.some((record:any) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record:any) => record.meta.requiresGuest)
  const requiresRole = to.matched.find((record:any) => record.meta.requiresRole)?.meta.requiresRole as string[] | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    // Save the intended destination for redirect after login
    const redirectPath = to.fullPath !== '/login' ? to.fullPath : null
    if (redirectPath) {
      localStorage.setItem('auth_redirect_url', redirectPath)
    }

    // Redirect to login if authentication is required but user is not authenticated
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Check if there's a saved redirect URL and clear it
    const redirectUrl = localStorage.getItem('auth_redirect_url')
    if (redirectUrl) {
      localStorage.removeItem('auth_redirect_url')
      next(redirectUrl)
    } else {
      // Redirect to dashboard if guest route but user is authenticated
      next('/dashboard')
    }
  } else if (requiresRole && requiresRole.length > 0) {
    // Check if user has required roles
    if (!authStore.hasAnyRole(requiresRole)) {
      // User doesn't have required role, redirect to dashboard with error
      console.warn(`Access denied. Required roles: ${requiresRole.join(', ')}`)
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router