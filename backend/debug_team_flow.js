
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testTeamFlow() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin_debug_1',
            password: 'password123'
        });

        const token = loginRes.data.session.access_token;
        console.log('Login successful. Token:', token ? 'Yes' : 'No');

        if (!token) throw new Error('No token received');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        // 2. Create Team
        console.log('\n2. Creating Team...');
        const uniqueSuffix = Date.now().toString().slice(-4);
        const teamData = {
            name: `Debug Team ${uniqueSuffix}`,
            short_code: `DT${uniqueSuffix}`,
            purse_start: 90,
            max_squad_size: 25,
            max_overseas: 8
        };

        const teamRes = await axios.post(`${API_URL}/teams`, teamData, { headers });
        console.log('Create Team Response:', teamRes.status, teamRes.data);
        const teamId = teamRes.data.team.id;

        // 3. Create Team User (Testing /signup without metadata)
        console.log('\n3. Creating Team User (signup no meta)...');
        // Note: We'll see if we can update profile later. First check if signup works.
        const userRes = await axios.post(`${API_URL}/auth/signup`, {
            email: `debug_team_${uniqueSuffix}@auction.local`,
            username: `debug_team_${uniqueSuffix}`,
            password: 'password123',
            // No role or team_id in body, so route won't put them in metadata
        }, { headers });

        console.log('Create Team User Response:', userRes.status, userRes.data);

        // 4. Update Team (check Edit flow)
        console.log('\n4. Updating Team...');
        const updateRes = await axios.put(`${API_URL}/teams/${teamId}`, {
            name: `Debug Team Updated ${uniqueSuffix}`,
        }, { headers });
        console.log('Update Team Response:', updateRes.status);

        console.log('\n✅ ALL TESTS PASSED');

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testTeamFlow();
