import { i18n } from '../locales'
import type { RequestStatus } from '../types'

export const getStatusLabel = (status: RequestStatus): string => {
  return i18n.global.t(`status.${status}`)
}

export const getTranslatedStatusLabels = (): Record<RequestStatus, string> => {
  return {
    NEW: i18n.global.t('status.NEW'),
    IN_PROGRESS: i18n.global.t('status.IN_PROGRESS'),
    RECONTACT: i18n.global.t('status.RECONTACT'),
    WON: i18n.global.t('status.WON'),
    LOST: i18n.global.t('status.LOST'),
    CLOSE: i18n.global.t('status.CLOSE')
  }
}