# 🎨 Boost Frontend - Vue.js

**Frontend Principal del Sistema Boost**

Este es el frontend principal desarrollado con **Vue.js 3 + TypeScript + Tailwind CSS**, parte del sistema completo de gestión de clientes potenciales, chat multi-plataforma y páginas de destino.

## 🚀 Tecnologías

- **Vue.js 3** - Framework progresivo
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utilitario
- **Pinia** - Estado global
- **Vue Router** - Enrutamiento
- **Socket.io Client** - Comunicación en tiempo real
- **@dnd-kit** - Drag & Drop
- **Recharts** - Gráficos y visualizaciones
- **@headlessui/vue** - Componentes accesibles

## 📋 Características

- ✅ **Dashboard Completo** con KPIs en tiempo real
- ✅ **Panel Kanban** estilo Trello para gestión de leads
- ✅ **Sistema de Chat Multi-Plataforma** (WhatsApp, Instagram, Facebook, Telegram, Email, SMS)
- ✅ **Gestión de Asignados** (Assignees)
- ✅ **Sistema de Cotizaciones**
- ✅ **Gestión de Páginas de Destino** dinámicas
- ✅ **Sistema de Activaciones** para campañas
- ✅ **Notificaciones** en tiempo real
- ✅ **Dark Mode** completo
- ✅ **Arquitectura de Presentación** limpia (DDD)
- ✅ **Integración Socket.io** para comunicación en tiempo real

## 🏗️ Arquitectura

```
src/
├── components/           # Componentes tradicionales
├── presentation/         # Arquitectura limpia (DDD)
│   ├── components/       # Componentes por dominio
│   │   ├── chat/         # Sistema de chat multi-plataforma
│   │   ├── dashboard/    # Dashboard y KPIs
│   │   ├── kanban/       # Panel Kanban
│   │   ├── assignees/    # Gestión de asignados
│   │   ├── quotations/   # Sistema de cotizaciones
│   │   ├── activations/  # Sistema de activaciones
│   │   ├── landing-pages/# Gestión de landing pages
│   │   ├── notifications/# Sistema de notificaciones
│   │   └── layout/       # Layout y navegación
│   ├── pages/           # Páginas de presentación
│   ├── stores/          # Estado de presentación
│   └── router/          # Enrutamiento
├── core/                # Componentes base reutilizables
├── stores/              # Estado global (Pinia)
├── services/            # Servicios de aplicación
├── types/               # Definiciones TypeScript
├── utils/               # Utilidades
└── locales/             # Internacionalización
```

## 🎯 Funcionalidades Principales

### Dashboard
- **KPIs en Tiempo Real**: Total requests, conversión, revenue, actividad de chat
- **Gráficos Interactivos**: Tendencias, distribuciones, actividad por plataforma
- **Métricas de Performance**: Tiempo promedio por estado, conversiones

### Panel Kanban
- **5 Columnas**: NEW, IN_PROGRESS, RECONTACT, WON, LOST
- **Drag & Drop**: Con confirmación de cambios de estado
- **Filtros y Búsqueda**: Avanzados y en tiempo real
- **Asignación Automática**: Basada en reglas configurables

### Sistema de Chat Multi-Plataforma
- **Multi-Plataforma**: WhatsApp, Instagram, Facebook, Telegram, Email, SMS
- **Interfaz de Tres Paneles**:
  - Panel izquierdo: Lista de conversaciones
  - Panel central: Área de mensajes con toggle de bot
  - Panel derecho: Información del cliente
- **Mensajería en Tiempo Real**: Con indicadores de estado y typing
- **Conversión Prospecto → Cliente**: Gestión completa del ciclo
- **Sistema de Notas**: Seguimiento y cotizaciones por cliente

### Gestión de Páginas de Destino
- **Creación Dinámica**: Editor visual de landing pages
- **Templates HTML**: Sistema de plantillas reutilizables
- **SEO Optimizado**: Meta tags y Open Graph
- **Analytics Integrado**: Seguimiento de conversiones

### Sistema de Activaciones
- **Gestión de Campañas**: Creación y seguimiento
- **Multi-Canal**: Email, SMS, WhatsApp, redes sociales
- **Segmentación**: Filtros avanzados de audiencia
- **Automatización**: Triggers y workflows

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview de build
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 🌐 Integración con Backend

### API Endpoints
- **Requests Information**: Gestión de solicitudes de información
- **Assignees**: Gestión de asignados
- **Quotations**: Sistema de cotizaciones
- **Activations**: Gestión de activaciones/campañas
- **Landing Pages**: Páginas de destino dinámicas
- **Chat**: Mensajes y conversaciones multi-plataforma

### Eventos Socket.io
```javascript
// Chat
socket.emit('load_conversations')
socket.emit('send_message', { conversationId, message })
socket.emit('convert_prospect', { prospectId, clientData })

// Notificaciones
socket.on('new_notification', (notification) => { /* mostrar */ })
socket.on('new_message', (message) => { /* actualizar chat */ })
```

## 🎨 Sistema de Temas (Dark Mode)

### Configuración
- **Persistencia Automática**: localStorage
- **Modo Sistema**: Sigue preferencias del OS
- **Transiciones Suaves**: Animaciones elegantes

### Uso en Componentes
```vue
<template>
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <h1 class="text-slate-600 dark:text-slate-300">Contenido</h1>
  </div>
</template>
```

## 📱 Responsive Design

- **Mobile**: < 768px - Sidebar colapsado, chat adaptado
- **Tablet**: 768px - 1024px - Sidebar compacto, paneles ajustables
- **Desktop**: > 1024px - Sidebar completo, tres paneles de chat

## 🧩 Componentes Core

### Button
```vue
<Button
  type="primary"
  size="md"
  :busy="loading"
  @click="handleClick"
>
  Guardar
</Button>
```

### Modal
```vue
<Modal
  v-model:is-open="showModal"
  title="Mi Modal"
  size="lg"
  :show-footer="true"
  @confirm="handleConfirm"
>
  Contenido del modal
</Modal>
```

### Chat Components
```vue
<!-- Lista de conversaciones -->
<ConversationsList
  :conversations="conversations"
  @select-conversation="handleSelect"
/>

<!-- Área de mensajes -->
<ChatMessages
  :messages="messages"
  :conversation="currentConversation"
  @send-message="handleSendMessage"
/>

<!-- Panel de cliente -->
<ClientPanel
  :client="selectedClient"
  @convert-prospect="handleConvert"
  @add-note="handleAddNote"
/>
```

## 🧪 Testing

El proyecto utiliza **Vitest** como framework de testing principal.

### Comandos de Testing

```bash
# Ejecutar tests en modo watch
npm run test

# Ejecutar tests una sola vez
npm run test:run

# Tests con reporte de cobertura
npm run test:coverage

# Interfaz visual de tests
npm run test:ui
```

### Configuración de Testing

- **Framework**: Vitest con Vue Test Utils
- **Entorno**: jsdom para simulación del DOM
- **Cobertura**: Reportes HTML, JSON y LCOV
- **Umbrales**: 70% mínimo de cobertura

### Estructura de Tests

```
src/
├── components/__tests__/     # Tests de componentes
├── stores/__tests__/         # Tests de stores Pinia
├── utils/__tests__/          # Tests de utilidades
└── test/
    ├── setup.ts             # Configuración global
    └── utils.ts             # Utilidades de testing
```

### Guía Completa

Para información detallada sobre testing, consulta **[TESTING.md](./TESTING.md)**.

## 📚 Documentación Adicional

Para información completa del sistema, consulta:

- **[🚀 README Principal](../../README.md)** - Documentación completa del sistema Boost
- **[💬 CHAT_SETUP.md](./CHAT_SETUP.md)** - Documentación detallada del sistema de chat
- **[🧩 Core Components](./src/core/README.md)** - Documentes de componentes base
- **[🐘 API Backend](../../synfony_p1/README.md)** - Documentación de la API

## 🤝 Contribución

1. Sigue los estándares de código
2. Usa TypeScript para nuevo código
3. Mantén la arquitectura de presentación
4. Actualiza la documentación

## 📝 Licencia

Este proyecto es parte del sistema Boost - © PithayaSoft

---

*Desarrollado con ❤️ por PithayaSoft*