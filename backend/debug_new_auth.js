
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testAuth() {
    const uniqueId = Date.now().toString().slice(-4);
    const username = `test_admin_${uniqueId}`;
    const email = `test_admin_${uniqueId}@gmail.com`;
    const password = 'password123';

    console.log('--- 1. Testing Signup ---');
    console.log(`Creating user: ${username} (${email})`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                role: 'admin'
            }
        }
    });

    if (signUpError) {
        console.error('❌ Signup Failed:', signUpError.message);
        return;
    }
    console.log('✅ Signup Successful User ID:', signUpData.user?.id);

    // Wait a moment for triggers
    await new Promise(r => setTimeout(r, 1000));

    console.log('\n--- 2. Verifying Profile (Trigger Check) ---');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile missing! Trigger may have failed.');
        console.error('Error:', profileError.message);
    } else {
        console.log('✅ Profile found:', profile.username);
    }

    console.log('\n--- 3. Testing RPC Lookup (Login Check) ---');
    // emulate auth.routes.js login logic
    const { data: emailLookup, error: rpcError } = await supabase
        .rpc('get_email_by_username', { _username: username });

    if (rpcError) {
        console.error('❌ RPC Lookup Failed:', rpcError.message);
    } else if (emailLookup !== email) {
        console.error(`❌ RPC mismatch! Expected ${email}, got ${emailLookup}`);
    } else {
        console.log('✅ RPC Lookup Successful');
    }

    console.log('\n--- 4. Testing Login ---');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: emailLookup || email,
        password
    });

    if (loginError) {
        console.error('❌ Login Failed:', loginError.message);
    } else {
        console.log('✅ Login Successful! Token received.');
    }
}

testAuth();
