import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, username, role, team_id, update_existing } = await req.json()

    // If updating existing user
    if (update_existing) {
      // Find the user by team_id
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('team_id', team_id)
        .single()

      if (!profile) {
        throw new Error('No user found for this team')
      }

      // Update user credentials if provided
      const updates: any = {}
      if (username) {
        updates.user_metadata = { username }
      }
      if (password) {
        updates.password = password
      }
      if (username && !password) {
        updates.email = `${username}@auction.local`
      }

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        profile.id,
        updates
      )

      if (updateError) throw updateError

      // Update profile username if changed
      if (username) {
        await supabaseClient
          .from('profiles')
          .update({ username, email: `${username}@auction.local` })
          .eq('id', profile.id)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User updated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new user with admin privileges (service role)
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email: email || `${username}@auction.local`,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
        team_id,
      },
    })

    if (userError) throw userError

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
