require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function testDeleteAll() {
    console.log('Testing Delete All logic...');

    try {
        // 1. Delete team_players
        console.log('Deleting team_players...');
        const { error: teamPlayersError } = await supabaseAdmin
            .from('team_players')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete not-equals 'nil' uuid means delete all

        if (teamPlayersError) console.error('Error deleting team_players:', teamPlayersError);
        else console.log('Deleted team_players successfully.');

        // 2. Delete players
        console.log('Deleting players...');
        const { error: deleteError } = await supabaseAdmin
            .from('players')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) console.error('Error deleting players:', deleteError);
        else console.log('Deleted players successfully.');

        // 3. Reset teams
        console.log('Resetting teams...');
        const { data: teams, error: teamsError } = await supabaseAdmin
            .from("teams")
            .select("id, purse_start");

        if (teamsError) console.error('Error fetching teams:', teamsError);

        if (teams) {
            for (const team of teams) {
                const { error: updateError } = await supabaseAdmin
                    .from("teams")
                    .update({
                        purse_remaining: team.purse_start,
                        squad_size: 0,
                        overseas_count: 0
                    })
                    .eq("id", team.id);

                if (updateError) console.error(`Error resetting team ${team.id}:`, updateError);
            }
        }
        console.log('Teams reset successfully.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testDeleteAll();
