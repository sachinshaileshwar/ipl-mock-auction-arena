const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
let supabaseAdmin;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ FATAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  // Create a dummy object to prevent crash on import, but methods will fail
  supabase = {
    auth: {
      getUser: async () => ({ error: { message: 'Server misconfiguration: Missing Supabase Env Vars' } }),
      signInWithPassword: async () => ({ error: { message: 'Server misconfiguration: Missing Supabase Env Vars' } }),
      signUp: async () => ({ error: { message: 'Server misconfiguration: Missing Supabase Env Vars' } }),
      signOut: async () => ({ error: { message: 'Server misconfiguration' } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ error: { message: 'Missing Env Vars' } }) }) }) }),
    rpc: async () => ({ error: { message: 'Missing Env Vars' } })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Supabase admin client for privileged operations
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️ Warning: Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.');
  supabaseAdmin = {
    auth: { admin: { createUser: async () => ({ error: { message: 'Missing Service Key' } }) } },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ error: { message: 'Missing Service Key' } }) }) }) })
  };
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = { supabase, supabaseAdmin };
