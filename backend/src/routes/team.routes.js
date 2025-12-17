const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

/**
 * GET /api/teams
 * Get all teams (public)
 */
router.get('/', async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch teams' });
  }
});

/**
 * GET /api/teams/:id
 * Get single team with players
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_players (
          *,
          players (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch team' });
  }
});

/**
 * POST /api/teams
 * Create new team (admin only)
 */
router.post('/', authenticate, authorizeAdmin, [
  body('name').notEmpty().withMessage('Team name is required'),
  body('short_code').notEmpty().withMessage('Short code is required'),
  body('purse_start').isNumeric().withMessage('Starting purse must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, short_code, purse_start, logo_url, max_squad_size, min_squad_size, max_overseas } = req.body;

    // Use supabaseAdmin to bypass RLS for creation
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({
        name,
        short_code,
        purse_start,
        purse_remaining: purse_start,
        logo_url,
        max_squad_size: max_squad_size || 25,
        min_squad_size: min_squad_size || 11,
        max_overseas: max_overseas || 8
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
});

/**
 * PUT /api/teams/:id
 * Update team (admin only)
 */
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Use supabaseAdmin to bypass RLS
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Team updated successfully', team });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
});

/**
 * DELETE /api/teams/:id
 * Delete team (admin only)
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete team' });
  }
});

/**
 * GET /api/teams/:id/user
 * Get user profile associated with team (admin only)
 */
router.get('/:id/user', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('team_id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    res.json({ username: profile?.username || '' });
  } catch (error) {
    console.error('Get team user error:', error);
    res.status(500).json({ error: 'Failed to fetch team user' });
  }
});

/**
 * GET /api/teams/:id/players
 * Get all players for a team
 */
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: players, error } = await supabase
      .from('team_players')
      .select(`
        *,
        players (*)
      `)
      .eq('team_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ players });
  } catch (error) {
    console.error('Get team players error:', error);
    res.status(500).json({ error: 'Failed to fetch team players' });
  }
});

/**
 * POST /api/teams/:id/retain
 * Retain a player for a team (admin only)
 */
router.post('/:id/retain', authenticate, authorizeAdmin, [
  body('player_id').notEmpty().withMessage('Player ID is required'),
  body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: team_id } = req.params;
    const { player_id, price } = req.body;

    // Add to team_players
    const { data: teamPlayer, error: insertError } = await supabase
      .from('team_players')
      .insert({
        team_id,
        player_id,
        price,
        is_retained: true
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update player status
    await supabase
      .from('players')
      .update({
        status: 'retained',
        sold_to_team_id: team_id,
        sold_price: price
      })
      .eq('id', player_id);

    // Update team purse
    const { data: team } = await supabase
      .from('teams')
      .select('purse_remaining')
      .eq('id', team_id)
      .single();

    await supabase
      .from('teams')
      .update({ purse_remaining: team.purse_remaining - price })
      .eq('id', team_id);

    res.status(201).json({ message: 'Player retained successfully', teamPlayer });
  } catch (error) {
    console.error('Retain player error:', error);
    res.status(500).json({ error: 'Failed to retain player' });
  }
});

/**
 * POST /api/teams/:id/logo
 * Upload team logo (admin only)
 */
router.post('/:id/logo', authenticate, authorizeAdmin, [
  body('image').notEmpty().withMessage('Image data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { image } = req.body; // Base64 string

    // Extract content type and base64 data
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const contentType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const fileExt = contentType.split('/')[1] || 'png';
    const fileName = `${id}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('team-logos')
      .getPublicUrl(fileName);

    // Update team logo_url
    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update({ logo_url: publicUrl })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: 'Logo uploaded successfully', team });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

/**
 * POST /api/teams/release
 * Release a retained player (admin only)
 */
router.post('/release', authenticate, authorizeAdmin, [
  body('team_id').notEmpty().withMessage('Team ID is required'),
  body('player_id').notEmpty().withMessage('Player ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { team_id, player_id } = req.body;

    // Get the transaction to refund
    const { data: transaction, error: txError } = await supabase
      .from('team_players')
      .select('price')
      .eq('team_id', team_id)
      .eq('player_id', player_id)
      .single();

    if (txError) throw new Error('Transaction not found');

    const refundAmount = transaction.price;

    // Delete team_player entry
    const { error: deleteError } = await supabase
      .from('team_players')
      .delete()
      .eq('team_id', team_id)
      .eq('player_id', player_id);

    if (deleteError) throw deleteError;

    // Refund team purse
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('purse_remaining')
      .eq('id', team_id)
      .single();

    if (teamError) throw teamError;

    await supabase
      .from('teams')
      .update({ purse_remaining: team.purse_remaining + refundAmount })
      .eq('id', team_id);

    // Reset player status
    await supabase
      .from('players')
      .update({
        status: 'not_started',
        sold_to_team_id: null,
        sold_price: null
      })
      .eq('id', player_id);

    res.json({ message: 'Player released successfully' });
  } catch (error) {
    console.error('Release player error:', error);
    res.status(500).json({ error: 'Failed to release player' });
  }
});

module.exports = router;
