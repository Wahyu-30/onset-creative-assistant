import { useEffect, useRef, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = `onset_${key}`

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${prefixedKey}"`, error)
      return initialValue
    }
  })
  const storedValueRef = useRef(storedValue)

  useEffect(() => {
    storedValueRef.current = storedValue
  }, [storedValue])

  useEffect(() => {
    const syncFromOtherTabs = (event) => {
      if (event.key !== prefixedKey) return

      try {
        const nextValue = event.newValue === null ? initialValue : JSON.parse(event.newValue)
        storedValueRef.current = nextValue
        setStoredValue(nextValue)
      } catch (error) {
        console.warn(`useLocalStorage: error syncing key "${prefixedKey}"`, error)
      }
    }

    window.addEventListener('storage', syncFromOtherTabs)
    return () => window.removeEventListener('storage', syncFromOtherTabs)
  }, [initialValue, prefixedKey])

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value
      storedValueRef.current = valueToStore
      setStoredValue(valueToStore)
      window.localStorage.setItem(prefixedKey, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`useLocalStorage: error setting key "${prefixedKey}"`, error)
    }
  }

  const removeValue = () => {
    try {
      window.localStorage.removeItem(prefixedKey)
      storedValueRef.current = initialValue
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`useLocalStorage: error removing key "${prefixedKey}"`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}
