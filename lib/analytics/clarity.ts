'use client'

export function clarityIdentify(userId: string, sessionId?: string): void {
  if (typeof window === 'undefined' || !window.clarity) return
  window.clarity('identify', userId, sessionId)
}

export function claritySetTag(key: string, value: string): void {
  if (typeof window === 'undefined' || !window.clarity) return
  window.clarity('set', key, value)
}
