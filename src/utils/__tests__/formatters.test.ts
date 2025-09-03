import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, truncateText } from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-500)).toBe('-$500.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00')
      expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('Jan 15, 2024')
      expect(formatDate(date, 'short')).toBe('1/15/24')
    })

    it('should handle invalid dates', () => {
      expect(formatDate(null as any)).toBe('')
      expect(formatDate(undefined as any)).toBe('')
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
      expect(truncateText(longText, 10)).toBe('This is a...')
    })

    it('should return original text if shorter than max length', () => {
      const shortText = 'Short text'
      expect(truncateText(shortText, 20)).toBe('Short text')
    })

    it('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText(null as any, 10)).toBe('')
      expect(truncateText(undefined as any, 10)).toBe('')
    })
  })
})