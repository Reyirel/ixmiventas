import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = 'https://yrxdqsrcyplimoyfinbc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeGRxc3JjeXBsaW1veWZpbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzA0NTEsImV4cCI6MjA2MTAwNjQ1MX0.DnVRr85-5nxfd9J8-fyuHBtrnjRQPVZA10EXPuNhvY8'

// Configuración específica para web/SSR
const createAsyncStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve(null)
        return Promise.resolve(window.localStorage.getItem(key))
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve()
        return Promise.resolve(window.localStorage.setItem(key, value))
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve()
        return Promise.resolve(window.localStorage.removeItem(key))
      }
    }
  }
  return AsyncStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createAsyncStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})