# 🚀 Boost - Sistema Completo de Gestión de Clientes Potenciales

**by PithayaSoft**

Un sistema completo y moderno para la gestión de solicitudes de información, potenciales clientes (leads), comunicación multi-plataforma y páginas de destino. Desarrollado con arquitectura modular, escalable y siguiendo las mejores prácticas de desarrollo.

---

## 📋 Descripción General

Boost es una plataforma integral que combina:

- **Frontend Web Principal** (Vue.js + TypeScript + Tailwind CSS)
- **Frontend Web Alternativo** (React + TypeScript)
- **Aplicación Móvil** (React Native + Expo)
- **Servidor de Sockets** (Node.js + Socket.io + WhatsApp Business API)
- **Backend API** (Symfony 7 + DDD + CQRS + RabbitMQ)
- **Sistema de Chat Multi-Plataforma** (WhatsApp, Instagram, Facebook, Telegram, Email, SMS)
- **Gestión de Páginas de Destino** (Landing Pages)
- **Sistema de Activaciones** (Activation Management)

### 🎯 Características Principales

- ✅ **Dashboard Completo** con KPIs en tiempo real
- ✅ **Panel Kanban** estilo Trello para gestión de leads
- ✅ **Sistema de Chat Multi-Plataforma** con integración WhatsApp Business API
- ✅ **Gestión de Páginas de Destino** dinámicas
- ✅ **Sistema de Activaciones** para campañas
- ✅ **Arquitectura Hexagonal** y DDD
- ✅ **Comunicación en Tiempo Real** con Socket.io
- ✅ **API RESTful** profesional con documentación Swagger
- ✅ **Soporte Multi-Organización** con aislamiento completo
- ✅ **Dark Mode** completo y responsive
- ✅ **Docker Ready** para fácil despliegue

---

## 🏗️ Arquitectura del Sistema

```
boost-pitahayasoft/
├── boost-from/              # Frontend Principal (Vue.js)
│   ├── src/
│   │   ├── components/      # Componentes tradicionales
│   │   ├── presentation/    # Arquitectura limpia (DDD)
│   │   ├── core/           # Componentes base reutilizables
│   │   ├── stores/         # Estado global (Pinia)
│   │   └── ...
├── boost-from-react/        # Frontend Alternativo (React)
├── boost-mobile-react-native/ # App Móvil (React Native)
├── boost-socket/            # Servidor de Sockets (Node.js)
├── synfony_p1/              # Backend API (Symfony)
└── README.md               # Esta documentación
```

### 🔄 Flujo de Datos

```
Cliente Web/Móvil → Socket Server → Symfony API → Base de Datos
                      ↓
                WhatsApp Business API
                Instagram, Facebook, Telegram
                Email, SMS
```

---

## 📁 Proyectos del Sistema

### 1. 🎨 boost-from (Frontend Principal)

**Tecnologías:** Vue.js 3 + TypeScript + Tailwind CSS + Pinia + Socket.io

Sistema frontend principal con dashboard completo, panel Kanban, chat multi-plataforma y gestión de leads.

#### Características
- ✅ **Dashboard con KPIs** en tiempo real
- ✅ **Panel Kanban** estilo Trello (5 columnas: NEW, IN_PROGRESS, RECONTACT, WON, LOST)
- ✅ **Sistema de Chat Multi-Plataforma** (WhatsApp, Instagram, Facebook, Telegram, Email, SMS)
- ✅ **Gestión de Asignados** (Assignees)
- ✅ **Sistema de Cotizaciones**
- ✅ **Gestión de Páginas de Destino** dinámicas
- ✅ **Sistema de Activaciones** para campañas
- ✅ **Notificaciones** en tiempo real
- ✅ **Dark Mode** completo
- ✅ **Arquitectura de Presentación** limpia (DDD)
- ✅ **Integración Socket.io** para comunicación en tiempo real

#### Estructura Arquitectural
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

#### Instalación
```bash
cd boost-from
npm install
npm run dev
```

### 2. ⚛️ boost-from-react (Frontend Alternativo)

**Tecnologías:** React + TypeScript + Vite

Versión alternativa del frontend en React para comparación y flexibilidad.

### 3. 📱 boost-mobile-react-native (Aplicación Móvil)

**Tecnologías:** React Native + Expo + TypeScript

Aplicación móvil nativa para gestión de leads en dispositivos móviles.

#### Instalación
```bash
cd boost-mobile-react-native
npm install
npx expo start
```

### 4. 🔌 boost-socket (Servidor de Comunicación)

**Tecnologías:** Node.js + Express + Socket.io + WhatsApp Business API

Servidor de sockets con integración multi-organización a WhatsApp Business API y soporte multi-plataforma.

#### Características
- ✅ **Comunicación en tiempo real** bidireccional
- ✅ **Integración WhatsApp Business API** de Meta
- ✅ **Soporte multi-plataforma** (Instagram, Facebook, Telegram)
- ✅ **Soporte multi-organización** con aislamiento completo
- ✅ **Webhooks dedicados** por organización
- ✅ **Salas aisladas** de conexiones Socket.io
- ✅ **Docker ready**

#### Instalación
```bash
cd boost-socket
npm install
npm run dev
```

### 5. 🐘 synfony_p1 (Backend API)

**Tecnologías:** Symfony 7 + PHP 8.2 + Doctrine + RabbitMQ + API Platform

API RESTful profesional con arquitectura hexagonal, CQRS y múltiples módulos de dominio.

#### Módulos de Dominio
- ✅ **RequestInformation** - Gestión de solicitudes de información
- ✅ **Assignee** - Gestión de asignados
- ✅ **PotentialCustomer** - Clientes potenciales
- ✅ **Quotation** - Sistema de cotizaciones
- ✅ **Activation** - Gestión de activaciones/campañas
- ✅ **LandingPage** - Páginas de destino dinámicas
- ✅ **Security** - Sistema de seguridad y autenticación
- ✅ **Events** - Infraestructura de eventos

#### Características
- ✅ **Arquitectura Hexagonal** (DDD + Ports & Adapters)
- ✅ **CQRS** con comandos y consultas separados
- ✅ **Symfony Messenger** + RabbitMQ para procesamiento asíncrono
- ✅ **Documentación automática** con Swagger UI (OpenAPI)
- ✅ **Docker/Docker Compose** para fácil despliegue
- ✅ **Event Sourcing** y Domain Events
- ✅ **Value Objects** y Aggregates
- ✅ **Repository Pattern** con Doctrine

#### Instalación
```bash
cd synfony_p1
docker-compose up -d --build
docker-compose exec app composer install
docker-compose exec app php bin/console doctrine:migrations:migrate
docker-compose exec app php bin/console messenger:consume async -vv
```

#### Endpoints Principales
- `POST /api/v1/requests-information` - Crear solicitud de información
- `GET /api/v1/requests-information` - Listar solicitudes con paginación
- `GET /api/v1/requests-information/total` - Total de solicitudes
- `POST /api/v1/activations` - Crear activación/campaña
- `GET /api/v1/landing-pages` - Listar páginas de destino
- `POST /api/v1/quotations` - Crear cotización

---

## 💬 Sistema de Chat Multi-Plataforma

### Características del Chat
- ✅ **Multi-Plataforma**: WhatsApp, Instagram, Facebook, Telegram, Email, SMS
- ✅ **Interfaz de Tres Paneles**:
  - Panel izquierdo: Lista de conversaciones
  - Panel central: Área de mensajes con toggle de bot
  - Panel derecho: Información del cliente con secciones expandibles
- ✅ **Mensajería en Tiempo Real**: Con indicadores de estado
- ✅ **Conversión Prospecto → Cliente**: Gestión completa del ciclo
- ✅ **Sistema de Notas**: Seguimiento y cotizaciones
- ✅ **Integración con Bot**: Activación/desactivación
- ✅ **URLs Directas**: Para conversaciones específicas

### Arquitectura del Chat
```typescript
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: 'prospect' | 'agent' | 'bot'
  content: string
  messageType: 'text' | 'image' | 'file' | 'audio'
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms'
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}
```

### Eventos Socket.io para Chat
```javascript
// Eventos del cliente
socket.emit('load_conversations')
socket.emit('send_message', { conversationId, message })
socket.emit('convert_prospect', { prospectId, clientData })

// Eventos del servidor
socket.on('new_message', (message) => { /* actualizar UI */ })
socket.on('conversation_updated', (data) => { /* actualizar lista */ })
```

---

## 🎨 Diseño y Paleta de Colores

### Paleta Schnauzer Pimienta (Elegante)

```css
/* Grises principales */
--charcoal: #1F2937      /* Sidebar, headers */
--slate-dark: #374151    /* Backgrounds secundarios */
--slate: #4B5563         /* Texto principal */
--slate-light: #6B7280   /* Texto secundario */
--silver: #9CA3AF        /* Bordes, iconos */
--platinum: #D1D5DB      /* Bordes suaves */
--pearl: #F3F4F6         /* Backgrounds claros */
--white: #FFFFFF         /* Backgrounds principales */

/* Acentos mínimos */
--accent-blue: #3B82F6   /* Links, botones primarios */
--accent-green: #10B981  /* Estados positivos (won) */
--accent-red: #EF4444    /* Estados negativos (lost) */
--accent-yellow: #F59E0B /* Estados de atención (recontact) */
```

---

## 📊 Dashboard y KPIs

### Métricas Principales
- **Total de Solicitudes**: Contador general de leads
- **Conversión**: Porcentaje de leads convertidos (WON)
- **Revenue**: Ingresos generados por cotizaciones
- **Tiempo Promedio**: Por estado en el pipeline
- **Actividad de Chat**: Mensajes enviados/recibidos por plataforma
- **Páginas de Destino**: Visitas y conversiones

### Gráficos Disponibles
- **Tendencias Temporales**: Líneas de evolución por estado
- **Distribución por Estados**: Pie chart de estados actuales
- **Actividad Reciente**: Timeline de últimos cambios
- **Performance por Asignado**: Métricas individuales
- **Análisis de Chat**: Actividad por plataforma
- **Métricas de Landing Pages**: Conversiones y engagement

---

## 📋 Panel Kanban (Gestión de Leads)

### Estados del Sistema
- **NEW** → Nuevas solicitudes
- **IN_PROGRESS** → En proceso
- **RECONTACT** → Recontactar
- **WON** → Ganadas
- **LOST** → Perdidas
- **CLOSE** → Cerradas (no se muestran en panel)

### Funcionalidades
- ✅ **Drag & Drop** con confirmación de cambios de estado
- ✅ **Validación de Transiciones**: Solo movimientos válidos entre estados
- ✅ **Filtros Avanzados**: Por fecha, cliente, valor, asignado
- ✅ **Búsqueda en Tiempo Real**: Header global
- ✅ **Cards Informativas**: Cliente, valor, fecha, notas, actividad de chat
- ✅ **Asignación Automática**: Basada en reglas configurables

### Transiciones Válidas
```
NEW → IN_PROGRESS, LOST
IN_PROGRESS → RECONTACT, WON, LOST
RECONTACT → IN_PROGRESS, WON, LOST
WON/LOST → No permiten cambios
```

---

## 🏠 Sistema de Páginas de Destino (Landing Pages)

### Características
- ✅ **Páginas Dinámicas**: Creación y edición desde el admin
- ✅ **Templates HTML**: Sistema de plantillas reutilizables
- ✅ **SEO Optimizado**: Meta tags y Open Graph
- ✅ **Analytics Integrado**: Seguimiento de conversiones
- ✅ **Responsive Design**: Optimizado para móviles
- ✅ **A/B Testing**: Múltiples versiones por página

### Arquitectura
```php
class LandingPage {
    private string $id;
    private string $title;
    private string $slug;
    private string $content;
    private array $metadata;
    private bool $isActive;
    private DateTime $createdAt;
}
```

---

## 🎯 Sistema de Activaciones (Campaign Management)

### Características
- ✅ **Gestión de Campañas**: Creación y seguimiento
- ✅ **Estados de Activación**: Activo, Inactivo, Pausado
- ✅ **Métricas de Performance**: Conversiones y engagement
- ✅ **Multi-Canal**: Email, SMS, WhatsApp, redes sociales
- ✅ **Segmentación de Audiencia**: Filtros avanzados
- ✅ **Automatización**: Triggers y workflows

### Estados de Activación
- **DRAFT** → Borrador
- **ACTIVE** → Activa
- **PAUSED** → Pausada
- **COMPLETED** → Completada
- **CANCELLED** → Cancelada

---

## 🔧 Dependencias y Librerías

### Frontend (boost-from)
```json
{
  "vue": "^3.4.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "pinia": "^2.1.0",
  "socket.io-client": "^4.7.0",
  "@dnd-kit/core": "^6.1.0",
  "recharts": "^2.8.0",
  "vue-router": "^4.2.0",
  "@headlessui/vue": "^1.7.0"
}
```

### Backend (synfony_p1)
```json
{
  "php": "^8.2",
  "symfony/framework-bundle": "^7.0",
  "doctrine/orm": "^3.0",
  "api-platform/core": "^3.0",
  "symfony/messenger": "^7.0",
  "rabbitmq": "^1.0",
  "lexik/jwt-authentication-bundle": "^2.0"
}
```

### Socket Server (boost-socket)
```json
{
  "node": "^18.0",
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "axios": "^1.6.0",
  "multer": "^1.4.0"
}
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PHP 8.2+ (opcional, para desarrollo local)

### Instalación Completa

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd boost-pitahayasoft
```

2. **Configurar Backend (Symfony)**
```bash
cd synfony_p1
cp .env.example .env
docker-compose up -d --build
docker-compose exec app composer install
docker-compose exec app php bin/console doctrine:migrations:migrate
docker-compose exec app php bin/console messenger:consume async -vv
```

3. **Configurar Socket Server**
```bash
cd ../boost-socket
cp .env.example .env
# Configurar credenciales de WhatsApp Business API
npm install
npm run dev
```

4. **Configurar Frontend Principal**
```bash
cd ../boost-from
npm install
npm run dev
```

5. **Configurar App Móvil (opcional)**
```bash
cd ../boost-mobile-react-native
npm install
npx expo start
```

### Variables de Entorno

#### Backend (.env)
```env
APP_ENV=dev
DATABASE_URL=mysql://user:password@db:3306/boost_db
RABBITMQ_DSN=amqp://guest:guest@rabbitmq:5672
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

#### Socket Server (.env)
```env
NODE_ENV=production
PORT=3001
META_ACCESS_TOKEN=your_whatsapp_token
META_PHONE_NUMBER_ID=your_phone_id
META_VERIFY_TOKEN=your_verify_token
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_ENV=development
```

---

## 🔌 Integración WhatsApp Business API

### Configuración Multi-Organización

1. **Crear aplicación en Meta for Developers**
2. **Obtener credenciales** por organización
3. **Configurar webhooks** específicos por organización
4. **Probar integración** con herramientas de Meta

### Endpoints de Webhook
- **Global**: `POST /api/whatsapp/webhook`
- **Por Organización**: `POST /api/whatsapp/webhook/{organizationId}`

### Envío de Mensajes Multi-Plataforma
```javascript
// WhatsApp
socket.emit('send_whatsapp_message', {
  to: '593987654321',
  message: 'Hola desde Boost',
  organizationId: 'org1'
});

// Instagram
socket.emit('send_instagram_message', {
  to: 'instagram_user_id',
  message: 'Mensaje desde Instagram',
  organizationId: 'org1'
});
```

---

## 🧪 Testing y Calidad

### Estrategia de Testing
- **Unit Tests**: Componentes individuales y casos de uso
- **Integration Tests**: APIs y servicios externos
- **E2E Tests**: Flujos completos de usuario
- **Performance Tests**: Carga y estrés del sistema
- **Chat Tests**: Integración multi-plataforma

### Ejecución de Tests
```bash
# Backend
cd synfony_p1
docker-compose exec app php bin/phpunit

# Frontend
cd boost-from
npm run test

# Socket Server
cd boost-socket
npm test
```

---

## 📊 Monitoreo y Logs

### Health Checks
- **Backend**: `GET /health` - Estado general del sistema
- **Socket Server**: `GET /health` - Estado de conexiones y organizaciones
- **Frontend**: Métricas de performance y errores
- **Chat System**: Estado de conexiones por plataforma

### Logs
- **Backend**: Logs de Symfony en `var/log/`
- **Socket Server**: Logs en `./logs/`
- **Frontend**: Console logs y herramientas de desarrollo
- **Chat**: Logs de mensajes y conexiones por plataforma

---

## 🚀 Despliegue en Producción

### Docker Compose Production
```yaml
version: '3.8'
services:
  backend:
    build: ./synfony_p1
    environment:
      - APP_ENV=prod
    ports:
      - "8080:80"

  socket-server:
    build: ./boost-socket
    ports:
      - "3001:3001"

  frontend:
    build: ./boost-from
    ports:
      - "80:80"

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: boost_prod

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
```

### Configuración de Proxy Reverso (Nginx)
```nginx
server {
    listen 80;
    server_name boost-app.com;

    location /api {
        proxy_pass http://localhost:8080;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **Frontend**: ESLint + Prettier + TypeScript strict
- **Backend**: PHP CS Fixer + PHPStan
- **Commits**: Conventional Commits
- **Documentación**: JSDoc/PHPDoc + READMEs
- **Testing**: Cobertura mínima del 80%

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

**© PithayaSoft - 2025**

---

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: support@pithayasoft.com
- **Documentación**: [docs.pithayasoft.com](https://docs.pithayasoft.com)
- **Issues**: [GitHub Issues](https://github.com/pithayasoft/boost/issues)

---

## 🔄 Flujo de Estados (Mermaid)

```mermaid
graph LR
    A[NEW] --> B[IN_PROGRESS]
    B --> C[RECONTACT]
    B --> D[WON]
    B --> E[LOST]
    C --> B
    C --> D
    C --> E
    D --> F[CLOSE]
    E --> F[CLOSE]

    style A fill:#f3f4f6
    style B fill:#3b82f6
    style C fill:#f59e0b
    style D fill:#10b981
    style E fill:#ef4444
    style F fill:#6b7280
```

---

## 🏗️ Arquitectura de Componentes (Mermaid)

```mermaid
graph TD
    A[App] --> B[Layout]
    B --> C[Header]
    B --> D[Sidebar]
    B --> E[MainContent]

    C --> F[SearchBar]
    C --> G[UserMenu]

    D --> H[Navigation]
    D --> I[StatusBadges]

    E --> J[Dashboard]
    E --> K[KanbanBoard]
    E --> L[ChatSystem]

    J --> M[KPICards]
    J --> N[Charts]
    J --> O[ActivityFeed]

    K --> P[KanbanColumn]
    P --> Q[RequestCard]

    L --> R[ConversationsList]
    L --> S[ChatMessages]
    L --> T[ClientPanel]

    style A fill:#1f2937
    style B fill:#374151
    style J fill:#3b82f6
    style K fill:#10b981
    style L fill:#f59e0b
```

---

## 📋 Módulos del Sistema (Mermaid)

```mermaid
graph TD
    A[Boost System] --> B[Frontend]
    A --> C[Backend]
    A --> D[Socket Server]
    A --> E[Mobile App]

    B --> F[Dashboard]
    B --> G[Kanban]
    B --> H[Chat]
    B --> I[Landing Pages]

    C --> J[RequestInformation]
    C --> K[Assignee]
    C --> L[Quotation]
    C --> M[Activation]
    C --> N[LandingPage]
    C --> O[Security]

    D --> P[WhatsApp]
    D --> Q[Instagram]
    D --> R[Facebook]
    D --> S[Telegram]

    style A fill:#1f2937
    style B fill:#3b82f6
    style C fill:#10b981
    style D fill:#f59e0b
    style H fill:#ef4444
```

---

*Esta documentación se actualiza continuamente. Para la información más reciente, consulta los README individuales de cada proyecto.*