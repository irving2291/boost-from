# 🧪 Guía de Testing - Boost Frontend

Esta guía explica cómo configurar y ejecutar tests en el proyecto Boost Frontend usando **Vitest**.

## 📋 Requisitos Previos

Asegúrate de tener instaladas las dependencias de testing:

```bash
npm install
```

Las dependencias de testing incluyen:
- `vitest` - Framework de testing
- `@vue/test-utils` - Utilidades para testing de componentes Vue
- `@vitest/coverage-v8` - Reportes de cobertura
- `@vitest/ui` - Interfaz visual para tests
- `jsdom` - Entorno DOM para testing

## 🚀 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests una vez (sin watch mode)
npm run test:run

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests con interfaz visual
npm run test:ui
```

### Modos de Ejecución

- **Watch Mode** (`npm run test`): Ejecuta tests automáticamente cuando cambian los archivos
- **Single Run** (`npm run test:run`): Ejecuta tests una sola vez
- **Coverage** (`npm run test:coverage`): Genera reporte de cobertura de código
- **UI Mode** (`npm run test:ui`): Interfaz visual en el navegador

## 📁 Estructura de Tests

```
src/
├── components/
│   └── __tests__/           # Tests de componentes
│       └── Component.test.ts
├── stores/
│   └── __tests__/           # Tests de stores Pinia
│       └── store.test.ts
├── utils/
│   └── __tests__/           # Tests de utilidades
│       └── utility.test.ts
├── test/
│   ├── setup.ts            # Configuración global de tests
│   └── utils.ts            # Utilidades para testing
```

## 🛠️ Configuración

### Vitest Config (`vitest.config.ts`)

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
})
```

### Setup Global (`src/test/setup.ts`)

```typescript
import { beforeAll } from 'vitest'

// Global test setup
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})
```

## 📝 Ejemplos de Tests

### Testing de Utilidades

```typescript
// src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, truncateText } from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('Jan 15, 2024')
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })
  })
})
```

### Testing de Componentes Vue

```typescript
// src/components/__tests__/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(Button, {
      props: { type: 'primary' }
    })

    expect(wrapper.classes()).toContain('bg-blue-600')
  })
})
```

### Testing de Stores Pinia

```typescript
// src/stores/__tests__/theme.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with light theme', () => {
    const themeStore = useThemeStore()
    expect(themeStore.currentTheme).toBe('light')
  })

  it('should toggle theme correctly', () => {
    const themeStore = useThemeStore()

    themeStore.toggleTheme()
    expect(themeStore.currentTheme).toBe('dark')

    themeStore.toggleTheme()
    expect(themeStore.currentTheme).toBe('light')
  })
})
```

## 🎯 Mejores Prácticas

### Estructura de Tests

1. **Describe blocks**: Agrupa tests relacionados
2. **Arrange-Act-Assert**: Estructura clara en cada test
3. **Nombres descriptivos**: Tests autoexplicativos
4. **Un test por funcionalidad**: Tests enfocados

### Testing de Componentes

```typescript
// ✅ Bueno
it('should display error message when input is invalid', async () => {
  const wrapper = mount(FormComponent, {
    props: { value: 'invalid-email' }
  })

  await wrapper.find('input').trigger('blur')

  expect(wrapper.text()).toContain('Invalid email format')
})

// ❌ Evita
it('test form', () => {
  // Test confuso sin propósito claro
})
```

### Mocks y Spies

```typescript
import { vi } from 'vitest'

// Mock de funciones
const mockFunction = vi.fn()
mockFunction.mockReturnValue('mocked value')

// Spy de métodos
const spy = vi.spyOn(object, 'method')
expect(spy).toHaveBeenCalledWith(expectedArgs)
```

### Testing Asíncrono

```typescript
it('should handle async operations', async () => {
  const promise = someAsyncFunction()
  await expect(promise).resolves.toBe('expected result')
})

it('should handle API calls', async () => {
  // Mock de axios/fetch
  vi.mock('axios')
  const mockResponse = { data: { success: true } }
  axios.get.mockResolvedValue(mockResponse)

  const result = await apiCall()
  expect(result).toEqual(mockResponse.data)
})
```

## 📊 Cobertura de Código

### Configuración de Umbrales

```typescript
coverage: {
  thresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Reporte de Cobertura

```bash
npm run test:coverage
```

Genera reportes en:
- `coverage/lcov-report/index.html` - Reporte HTML
- `coverage/coverage-final.json` - Datos JSON

## 🔧 Debugging de Tests

### Modo Debug

```bash
# Ejecutar test específico en modo debug
npm run test -- --reporter=verbose Button.test.ts

# Ejecutar con logs detallados
npm run test -- --reporter=verbose
```

### Vitest UI

```bash
npm run test:ui
```

Abre interfaz visual en `http://localhost:51204`

## 🚀 Integración con CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## 📚 Recursos Adicionales

- [Documentación de Vitest](https://vitest.dev/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Guías de Testing Vue](https://vuejs.org/guide/scaling-up/testing.html)

## 🎯 Checklist de Testing

- [ ] Tests de utilidades implementados
- [ ] Tests de componentes básicos
- [ ] Tests de stores Pinia
- [ ] Tests de integración
- [ ] Cobertura de código > 70%
- [ ] Tests pasan en CI/CD
- [ ] Tests de accesibilidad
- [ ] Tests de performance

---

*Recuerda: Los tests son código que se mantiene, así que escribe tests limpios, legibles y mantenibles.*