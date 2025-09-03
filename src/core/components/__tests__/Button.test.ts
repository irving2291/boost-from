import { describe, it, expect, vi } from 'vitest'
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

  it('applies primary type classes by default', () => {
    const wrapper = mount(Button)

    expect(wrapper.classes()).toContain('bg-blue-600')
    expect(wrapper.classes()).toContain('hover:bg-blue-700')
  })

  it('applies different type classes', () => {
    const wrapper = mount(Button, {
      props: { type: 'success' }
    })

    expect(wrapper.classes()).toContain('bg-green-600')
    expect(wrapper.classes()).toContain('hover:bg-green-700')
  })

  it('applies different size classes', () => {
    const wrapper = mount(Button, {
      props: { size: 'lg' }
    })

    expect(wrapper.classes()).toContain('px-6')
    expect(wrapper.classes()).toContain('py-3')
    expect(wrapper.classes()).toContain('text-lg')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toBeInstanceOf(Array)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when busy', async () => {
    const wrapper = mount(Button, {
      props: { busy: true },
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('shows loading spinner when busy', () => {
    const wrapper = mount(Button, {
      props: { busy: true },
      slots: {
        default: 'Loading...'
      }
    })

    const spinner = wrapper.find('svg')
    expect(spinner.exists()).toBe(true)
    expect(spinner.classes()).toContain('animate-spin')
  })

  it('applies disabled attribute when disabled', () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('applies disabled attribute when busy', () => {
    const wrapper = mount(Button, {
      props: { busy: true }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('has correct accessibility attributes', () => {
    const wrapper = mount(Button)

    expect(wrapper.attributes('type')).toBe('button')
    // Button should be focusable
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })
})