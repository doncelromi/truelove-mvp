import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const WHATSAPP_URL =
  'https://wa.me/5491139375146?text=Vi%20el%20demo%20de%20True%20Love%2C%20quiero%20arrancar!'

export function openWhatsApp() {
  window.open(WHATSAPP_URL, '_blank', 'noopener')
}

export function ss<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(key)
    return v == null ? fallback : (JSON.parse(v) as T)
  } catch {
    return fallback
  }
}
export function ssSet(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
export function ssClear() {
  try {
    sessionStorage.clear()
  } catch {
    /* ignore */
  }
}

export const fmtUSD = (n: number, lang: 'es' | 'en' = 'es') =>
  'USD ' + n.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US', { maximumFractionDigits: 0 })

export const fmtNum = (n: number, lang: 'es' | 'en' = 'es') =>
  n.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US', { maximumFractionDigits: 0 })

export function initials(nombre: string, apellido = '') {
  return ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase()
}

/** PRNG determinístico para mock estable */
export function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
