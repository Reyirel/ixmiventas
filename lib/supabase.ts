import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yrxdqsrcyplimoyfinbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeGRxc3JjeXBsaW1veWZpbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzA0NTEsImV4cCI6MjA2MTAwNjQ1MX0.DnVRr85-5nxfd9J8-fyuHBtrnjRQPVZA10EXPuNhvY8' // o usa env vars
)
