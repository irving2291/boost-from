# Sistema Core de Componentes

Este directorio contiene todos los componentes reutilizables y utilidades del sistema core de la aplicación.

## 🎨 Sistema de Temas (Dark Mode)

### Configuración

El sistema de temas está completamente configurado y funcional:

1. **Store de Tema** (`stores/theme.ts`): Maneja el estado global del tema
2. **LocalStorage**: Los temas se guardan automáticamente en `localStorage` con la clave `'theme'`
3. **Tailwind CSS**: Configurado con `darkMode: 'class'` para soporte completo

### Uso del Sistema de Temas

#### En Componentes Vue

```vue
<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// Cambiar tema
themeStore.setTheme('dark')   // Modo oscuro
themeStore.setTheme('light')  // Modo claro
themeStore.toggleTheme()      // Alternar entre claro/oscuro

// Verificar tema actual
console.log(themeStore.currentTheme) // 'light' | 'dark'
console.log(themeStore.isDark)       // boolean
console.log(themeStore.isLight)      // boolean
</script>
```

#### En Templates

```vue
<template>
  <!-- Clases que cambian según el tema -->
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <h1 class="text-slate-600 dark:text-slate-300">Título</h1>
    <p class="border-gray-200 dark:border-gray-700">Contenido</p>
  </div>
</template>
```

### Ubicaciones de Control de Tema

1. **Header**: Dropdown con opciones Claro/Oscuro/Sistema
2. **Configuraciones**: Página completa con GroupButton para selección de tema
3. **Programático**: Usando el store directamente

### Persistencia

- ✅ **Automática**: Los cambios se guardan automáticamente en `localStorage`
- ✅ **Restauración**: Al recargar la página, se restaura el tema guardado
- ✅ **Sistema**: Opción para seguir la preferencia del sistema operativo

### Inicialización

El tema se inicializa automáticamente en `main.ts`:

```typescript
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
themeStore.initializeTheme() // Se ejecuta al cargar la app
```

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

### Input
```vue
<Input
  v-model="value"
  label="Nombre"
  placeholder="Ingresa tu nombre"
  :error="errorMessage"
  required
/>
```

### Dropdown
```vue
<Dropdown
  v-model="selected"
  :items="options"
  placeholder="Selecciona una opción"
  searchable
/>
```

### Card
```vue
<Card>
  <template #header>
    <h2>Título</h2>
  </template>
  
  Contenido de la tarjeta
  
  <template #footer>
    <Button>Acción</Button>
  </template>
</Card>
```

### GroupButton
```vue
<GroupButton
  v-model="selected"
  :buttons="options"
  @change="handleChange"
/>
```

### ListView
```vue
<ListView
  :items="listItems"
  :loading="isLoading"
  @item-click="handleItemClick"
/>
```

## 📁 Estructura

```
src/core/
├── index.ts              # Exportaciones principales
├── types.ts              # Definiciones TypeScript
├── utils.ts              # Utilidades y helpers
├── README.md             # Esta documentación
└── components/
    ├── Button.vue
    ├── Modal.vue
    ├── Dropdown.vue
    ├── Input.vue
    ├── GroupButton.vue
    ├── Card.vue
    ├── ListView.vue
    └── ListTile.vue
```

## 🚀 Importación

```typescript
// Importar componentes individuales
import { Button, Modal, Card } from '@/core'

// Importar tipos
import type { ButtonType, ModalProps } from '@/core/types'

// Importar utilidades
import { getButtonClasses } from '@/core/utils'
```

## 🎯 Características

- ✅ **Dark Mode Completo**: Todos los componentes soportan modo oscuro
- ✅ **TypeScript**: Tipado completo para mejor experiencia de desarrollo
- ✅ **Persistencia**: Configuraciones guardadas en localStorage
- ✅ **Accesibilidad**: Componentes accesibles con navegación por teclado
- ✅ **Animaciones**: Transiciones suaves y profesionales
- ✅ **Flexibilidad**: Props extensivas para personalización
- ✅ **Consistencia**: Sistema de diseño unificado