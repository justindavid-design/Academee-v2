import { createClient } from '@supabase/supabase-js'
import { getMissingPublicEnvError } from './env'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_CONFIG_ERROR = getMissingPublicEnvError(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])

function makeNoopClient() {
  const noop = async () => ({ data: null, error: new Error('Supabase not configured') })
  const table = {
    select: () => table,
    eq: () => table,
    maybeSingle: async () => ({ data: null, error: null, status: 200 }),
    upsert: async () => ({ data: null, error: new Error('Supabase not configured') }),
  }

  return {
    configError: SUPABASE_CONFIG_ERROR,
    isConfigured: false,
    auth: {
      getUser: async () => ({ data: { user: null } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: noop,
      signUp: noop,
      signOut: noop,
      resetPasswordForEmail: noop,
      updateUser: noop,
    },
    from: () => table,
  }
}

let supabase
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (typeof console !== 'undefined' && console.error) {
    console.error(SUPABASE_CONFIG_ERROR)
  }
  supabase = makeNoopClient()
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
  supabase.isConfigured = true
  supabase.configError = ''
}

export default supabase
