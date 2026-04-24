import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export const jsonStorage = <T = string | string[] | boolean>() =>
  createJSONStorage<T>(() => ({
    getItem,
    setItem,
    removeItem,
    clearAll,
  }))

function getItem(key: string): string | null {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

function setItem(key: string, value: string): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function removeItem(key: string): void {
  localStorage.removeItem(key)
}

function clearAll(): void {
  localStorage.clear()
}

export const persistedAtom = <T = string | string[] | boolean>(
  key: string,
  initialValue: T
) => atomWithStorage<T>(key, initialValue, jsonStorage())
