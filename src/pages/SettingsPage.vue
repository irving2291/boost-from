<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Configuración</h1>
        <p class="text-slate-600 mt-1">
          Administra la configuración del sistema y preferencias.
        </p>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Settings -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Configuración General</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value="CRM System"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value="contact@crmsystem.com"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Zona Horaria
              </label>
              <select class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>UTC-5 (Ecuador)</option>
                <option>UTC-3 (Argentina)</option>
                <option>UTC-6 (México)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Notificaciones</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700">Email Notifications</p>
                <p class="text-xs text-slate-500">Recibir notificaciones por email</p>
              </div>
              <input type="checkbox" checked class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700">Push Notifications</p>
                <p class="text-xs text-slate-500">Notificaciones en el navegador</p>
              </div>
              <input type="checkbox" class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700">SMS Notifications</p>
                <p class="text-xs text-slate-500">Notificaciones por SMS</p>
              </div>
              <input type="checkbox" class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <!-- User Management -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Gestión de Usuarios</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">MG</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900">María García</p>
                  <p class="text-xs text-slate-500">Admin</p>
                </div>
              </div>
              <button class="text-blue-600 text-sm hover:text-blue-800">Editar</button>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">CR</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900">Carlos Ruiz</p>
                  <p class="text-xs text-slate-500">Usuario</p>
                </div>
              </div>
              <button class="text-blue-600 text-sm hover:text-blue-800">Editar</button>
            </div>
            <button class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Agregar Usuario
            </button>
          </div>
        </div>

        <!-- System Info -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Información del Sistema</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-slate-600">Versión:</span>
              <span class="text-sm font-medium text-slate-900">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600">Última Actualización:</span>
              <span class="text-sm font-medium text-slate-900">15 Ene 2024</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600">Base de Datos:</span>
              <span class="text-sm font-medium text-green-600">Conectada</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600">Almacenamiento:</span>
              <span class="text-sm font-medium text-slate-900">2.3 GB / 10 GB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4">
        <button class="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/layout/Layout.vue'
</script>