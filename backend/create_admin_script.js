const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Look in backend/ dir
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use Anon Key

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin_debug_1@test.com';
    const password = 'password123';
    const username = 'admin_debug_1';

    console.log(`Attempting to signup user: ${email}...`);

    // 1. Sign Up (Standard Flow)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                role: 'admin' // requesting admin role via metadata
            }
        }
    });

    if (error) {
        console.error('❌ Signup failed:', error.message);
        if (error.message === 'User already registered') {
            console.log('User exists. Trying login...');
        } else {
            process.exit(1);
        }
    } else {
        console.log('✅ Auth User created/found:', data.user?.id);
    }

    // 2. Try to Login to verify
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        process.exit(1);
    }

    console.log('✅ Login successful via Auth.');

    // 3. Verify Profile Creation
    // Now we have a session, we can query profiles as the user
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
        console.log('⚠️ This likely means the TRIGGER failed to create the profile row.');
    } else {
        console.log('✅ Profile found:', profile);
        console.log(`User Role: ${profile.role}`);
    }
}

createAdmin();
