# 🎨 Boost Frontend - Vue.js

**Frontend Principal del Sistema Boost**

Este es el frontend principal desarrollado con **Vue.js 3 + TypeScript + Tailwind CSS**, parte del sistema completo de gestión de clientes potenciales.

## 🚀 Tecnologías

- **Vue.js 3** - Framework progresivo
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utilitario
- **Pinia** - Estado global
- **Vue Router** - Enrutamiento
- **Socket.io Client** - Comunicación en tiempo real
- **@dnd-kit** - Drag & Drop
- **Recharts** - Gráficos y visualizaciones

## 📋 Características

- ✅ **Dashboard Completo** con KPIs en tiempo real
- ✅ **Panel Kanban** estilo Trello para gestión de leads
- ✅ **Sistema de Asignados** (Assignees)
- ✅ **Gestión de Cotizaciones**
- ✅ **Dark Mode** completo
- ✅ **Componentes Core** reutilizables
- ✅ **Integración Socket.io** para comunicación en tiempo real
- ✅ **Responsive Design** para todos los dispositivos

## 🏗️ Arquitectura

```
src/
├── components/           # Componentes reutilizables
├── pages/               # Páginas principales
├── stores/              # Estado global (Pinia)
├── core/                # Componentes base y utilidades
├── presentation/        # Arquitectura limpia (presentación)
├── domain/             # Lógica de dominio
├── infrastructure/     # Capa de infraestructura
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades
└── locales/            # Internacionalización
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

### Variables de Entorno
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_ENV=development
```

## 🎯 Funcionalidades Principales

### Dashboard
- **KPIs en Tiempo Real**: Total requests, conversión, revenue
- **Gráficos Interactivos**: Tendencias, distribuciones, actividad
- **Métricas de Performance**: Tiempo promedio por estado

### Panel Kanban
- **5 Columnas**: NEW, IN_PROGRESS, RECONTACT, WON, LOST
- **Drag & Drop**: Con confirmación de cambios de estado
- **Filtros y Búsqueda**: Avanzados y en tiempo real
- **Cards Informativas**: Cliente, valor, fecha, notas

### Gestión de Asignados
- **CRUD Completo**: Crear, editar, eliminar asignados
- **Asignación de Leads**: A agentes específicos
- **Métricas por Asignado**: Performance individual

### Sistema de Cotizaciones
- **Creación de Cotizaciones**: Desde leads
- **Seguimiento**: Estados y valores
- **Integración**: Con dashboard y reportes

## 🧩 Componentes Core

### Sistema de Temas (Dark Mode)
- **Persistencia Automática**: localStorage
- **Modo Sistema**: Sigue preferencias del OS
- **Transiciones Suaves**: Animaciones elegantes

### Componentes Base
- **Button**: Variantes y estados
- **Modal**: Diálogos reutilizables
- **Input**: Campos de formulario
- **Dropdown**: Selectores avanzados
- **Card**: Contenedores flexibles
- **GroupButton**: Selección múltiple

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
- **Analytics**: Métricas y reportes

### Socket.io Events
- **join_room**: Unirse a salas de chat
- **send_message**: Enviar mensajes
- **send_whatsapp_message**: Integración WhatsApp
- **new_message**: Recibir mensajes

## 📱 Responsive Design

- **Mobile**: < 768px - Sidebar colapsado
- **Tablet**: 768px - 1024px - Sidebar compacto
- **Desktop**: > 1024px - Sidebar completo

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📚 Documentación Adicional

Para información completa del sistema, consulta:

- **[README Principal](../../README.md)** - Documentación completa del sistema Boost
- **[Core Components](./src/core/README.md)** - Documentación de componentes base
- **[API Documentation](../../synfony_p1/README.md)** - Backend API

## 🤝 Contribución

1. Sigue los estándares de código
2. Usa TypeScript para nuevo código
3. Mantén la arquitectura de componentes
4. Actualiza la documentación

## 📝 Licencia

Este proyecto es parte del sistema Boost - © PithayaSoft

---

*Desarrollado con ❤️ por PithayaSoft*
