const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

/**
 * GET /api/players
 * Get all players with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, is_overseas, set_no, search } = req.query;

    let query = supabase
      .from('players')
      .select('*, teams:sold_to_team_id(name, short_code, logo_url)')
      .order('set_no', { ascending: true })
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (is_overseas !== undefined) query = query.eq('is_overseas', is_overseas === 'true');
    if (set_no) query = query.eq('set_no', parseInt(set_no));
    if (search) query = query.ilike('name', `%${search}%`);

    const { data: players, error } = await query;

    if (error) throw error;

    res.json({ players });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

/**
 * GET /api/players/available
 * Get available players grouped by set
 */
router.get('/available', async (req, res) => {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .eq('status', 'not_started')
      .order('set_no', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    // Group by set_no
    const groupedPlayers = players.reduce((acc, player) => {
      const setNo = player.set_no || 0;
      if (!acc[setNo]) acc[setNo] = [];
      acc[setNo].push(player);
      return acc;
    }, {});

    res.json({ players: groupedPlayers });
  } catch (error) {
    console.error('Get available players error:', error);
    res.status(500).json({ error: 'Failed to fetch available players' });
  }
});

/**
 * GET /api/players/:id
 * Get single player
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: player, error } = await supabase
      .from('players')
      .select('*, teams:sold_to_team_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ player });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/**
 * POST /api/players
 * Create new player (admin only)
 */
router.post('/', authenticate, authorizeAdmin, [
  body('name').notEmpty().withMessage('Player name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('base_price').isNumeric().withMessage('Base price must be a number'),
  body('country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playerData = req.body;

    const { data: player, error } = await supabaseAdmin
      .from('players')
      .insert({
        ...playerData,
        is_overseas: playerData.country !== 'India',
        status: 'not_started'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Player created successfully', player });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

/**
 * POST /api/players/bulk
 * Bulk import players from CSV (admin only)
 */
router.post('/bulk', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: 'Players array is required' });
    }

    // Process and validate each player
    const processedPlayers = players.map(player => ({
      name: player.name,
      category: player.category,
      base_price: parseFloat(player.base_price),
      country: player.country || 'India',
      is_overseas: player.country !== 'India',
      set_no: player.set_no || null,
      role: player.role || null,
      photo_url: player.photo_url || null,
      matches_played: player.matches_played || null,
      total_runs: player.total_runs || null,
      batting_average: player.batting_average || null,
      batting_strike_rate: player.batting_strike_rate || null,
      highest_score: player.highest_score || null,
      total_wickets: player.total_wickets || null,
      bowling_average: player.bowling_average || null,
      economy_rate: player.economy_rate || null,
      best_bowling: player.best_bowling || null,
      status: 'not_started'
    }));

    const { data, error } = await supabaseAdmin
      .from('players')
      .insert(processedPlayers)
      .select();

    if (error) throw error;

    res.status(201).json({
      message: `${data.length} players imported successfully`,
      players: data
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import players' });
  }
});

/**
 * PUT /api/players/:id
 * Update player (admin only)
 */
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: player, error } = await supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Player updated successfully', player });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

/**
 * DELETE /api/players/all
 * Delete all players and reset auction state (admin only)
 */
router.delete('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Delete all team_players (sold players)
    // We must use supabaseAdmin to bypass RLS policies
    const { error: teamPlayersError } = await supabaseAdmin
      .from('team_players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (teamPlayersError) throw teamPlayersError;

    // Delete all players
    const { error: deleteError } = await supabaseAdmin
      .from('players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) throw deleteError;

    // Reset team purses and squads
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("id, purse_start");

    if (teamsError) throw teamsError;

    if (teams) {
      for (const team of teams) {
        await supabaseAdmin
          .from("teams")
          .update({
            purse_remaining: team.purse_start
          })
          .eq("id", team.id);
      }
    }

    res.json({ message: 'All players deleted and team purses reset successfully' });
  } catch (error) {
    console.error('Delete all players error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/players/:id
 * Delete player (admin only)
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

/**
 * DELETE /api/players
 * Delete all players (admin only)
 */
router.delete('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Reset all team purses first
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('id, purse_start');

    for (const team of teams || []) {
      await supabaseAdmin
        .from('teams')
        .update({ purse_remaining: team.purse_start })
        .eq('id', team.id);
    }

    // Delete all team_players
    await supabaseAdmin.from('team_players').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all players
    const { error } = await supabaseAdmin
      .from('players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;

    res.json({ message: 'All players deleted and team purses reset' });
  } catch (error) {
    console.error('Delete all players error:', error);
    res.status(500).json({ error: 'Failed to delete players' });
  }
});

module.exports = router;
