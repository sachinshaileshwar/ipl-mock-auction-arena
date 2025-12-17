require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function checkAndResetTeams() {
    console.log('--- Checking Teams State ---');

    // 1. Fetch current state
    const { data: teams, error } = await supabaseAdmin
        .from('teams')
        .select('id, name, purse_start, purse_remaining, squad_size, overseas_count');

    if (error) {
        console.error('Error fetching teams:', error);
        return;
    }

    console.log('Current Teams:', JSON.stringify(teams, null, 2));

    // 2. Simulate Reset Logic
    console.log('\n--- Running Reset Logic (Simulation) ---');
    for (const team of teams) {
        if (team.purse_remaining !== team.purse_start) {
            console.log(`Resetting Team: ${team.name} (${team.id})`);
            console.log(`  Current Remaining: ${team.purse_remaining}`);
            console.log(`  Target Start:     ${team.purse_start}`);

            const { data: updated, error: updateError } = await supabaseAdmin
                .from('teams')
                .update({
                    purse_remaining: team.purse_start,
                    squad_size: 0,
                    overseas_count: 0
                })
                .eq('id', team.id)
                .select();

            if (updateError) console.error('  Update failed:', updateError);
            else console.log('  Update successful:', updated[0].purse_remaining);
        } else {
            console.log(`Team ${team.name} is already reset.`);
        }
    }
}

checkAndResetTeams();
