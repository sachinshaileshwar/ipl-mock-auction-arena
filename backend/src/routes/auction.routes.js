const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

/**
 * GET /api/auction/current
 * Get current live auction round
 */
/**
 * GET /api/auction/current
 * Get current live auction round
 */
router.get('/current', async (req, res) => {
  try {
    const { data: round, error } = await supabaseAdmin
      .from('auction_rounds')
      .select(`
        *,
        players (*),
        teams:current_bid_team_id (*)
      `)
      .eq('status', 'live')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ round: round || null });
  } catch (error) {
    console.error('Get current auction error:', error);
    res.status(500).json({ error: 'Failed to fetch current auction' });
  }
});

/**
 * GET /api/auction/history
 * Get auction history (completed rounds)
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: rounds, error } = await supabaseAdmin
      .from('auction_rounds')
      .select(`
        *,
        players (*),
        teams:current_bid_team_id (*)
      `)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ rounds });
  } catch (error) {
    console.error('Get auction history error:', error);
    res.status(500).json({ error: 'Failed to fetch auction history' });
  }
});

/**
 * GET /api/auction/recently-sold
 * Get recently sold players
 */
router.get('/recently-sold', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('*, teams:sold_to_team_id(*)')
      .in('status', ['sold', 'unsold'])
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ players });
  } catch (error) {
    console.error('Get recently sold error:', error);
    res.status(500).json({ error: 'Failed to fetch recently sold players' });
  }
});

/**
 * GET /api/auction/stats
 * Get auction statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // 1. Team Spending & Players Count
    const { data: teamsData, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id, name, purse_start, purse_remaining');

    if (teamsError) throw teamsError;

    // Fetch team players to calculate spending manually if needed, or infer from purse
    const { data: soldPlayers, error: playersError } = await supabaseAdmin
      .from('players')
      .select('*') // or just needed fields like sold_price, category, sold_to_team_id
      .eq('status', 'sold');

    if (playersError) throw playersError;

    // Also get retained players as they count towards spending/squad
    const { data: retainedPlayers, error: retainedError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('status', 'retained');

    if (retainedError) throw retainedError;

    const allSoldPlayers = [...(soldPlayers || []), ...(retainedPlayers || [])];

    // Calculate Team Spending
    const teamSpending = teamsData.map(team => {
      const teamPlayers = allSoldPlayers.filter(p => p.sold_to_team_id === team.id);
      const totalSpent = team.purse_start - team.purse_remaining; // simple way if purse is accurate
      // OR sum up player prices
      const totalSpentCalc = teamPlayers.reduce((sum, p) => sum + (parseFloat(p.sold_price) || 0), 0);

      return {
        name: team.name,
        players: teamPlayers.length,
        total: totalSpentCalc
      };
    }).sort((a, b) => b.total - a.total);

    // 2. Most Expensive Players
    const expensivePlayers = [...allSoldPlayers]
      .sort((a, b) => (parseFloat(b.sold_price) || 0) - (parseFloat(a.sold_price) || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        category: p.category,
        team: teamsData.find(t => t.id === p.sold_to_team_id)?.name || 'Unknown',
        sold_price: p.sold_price
      }));

    // 3. Category Distribution
    const categoryCounts = {};
    allSoldPlayers.forEach(p => {
      const cat = p.category || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));

    // 4. Total Spent
    const totalSpent = allSoldPlayers.reduce((sum, p) => sum + (parseFloat(p.sold_price) || 0), 0);

    res.json({
      teamSpending,
      expensivePlayers,
      categoryDistribution,
      totalSpent
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch auction stats' });
  }
});

/**
 * POST /api/auction/start
 * Start auction for a player (admin only)
 */
/**
 * POST /api/auction/start
 * Start auction for a player (admin only)
 */
router.post('/start', authenticate, authorizeAdmin, [
  body('player_id').notEmpty().withMessage('Player ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { player_id } = req.body;

    // Check if there's already a live auction
    const { data: existingRound } = await supabaseAdmin
      .from('auction_rounds')
      .select('id')
      .eq('status', 'live')
      .single();

    if (existingRound) {
      return res.status(400).json({ error: 'An auction is already in progress' });
    }

    // Get player details
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', player_id)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Create auction round
    const { data: round, error } = await supabaseAdmin
      .from('auction_rounds')
      .insert({
        player_id,
        current_bid: player.base_price,
        status: 'live'
      })
      .select(`
        *,
        players (*)
      `)
      .single();

    if (error) throw error;

    // Update player status
    await supabaseAdmin
      .from('players')
      .update({ status: 'in_auction' })
      .eq('id', player_id);

    res.status(201).json({ message: 'Auction started', round });
  } catch (error) {
    console.error('Start auction error:', error);
    res.status(500).json({ error: 'Failed to start auction' });
  }
});

/**
 * POST /api/auction/bid
 * Place a bid (admin only)
 */
router.post('/bid', authenticate, authorizeAdmin, [
  body('round_id').notEmpty().withMessage('Round ID is required'),
  body('team_id').notEmpty().withMessage('Team ID is required'),
  body('amount').isNumeric().withMessage('Bid amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { round_id, team_id, amount } = req.body;

    // Verify team has enough purse
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('purse_remaining, name')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.purse_remaining < amount) {
      return res.status(400).json({
        error: `${team.name} does not have enough purse. Available: ₹${team.purse_remaining} Cr`
      });
    }

    // Update auction round
    const { data: round, error } = await supabaseAdmin
      .from('auction_rounds')
      .update({
        current_bid: amount,
        current_bid_team_id: team_id
      })
      .eq('id', round_id)
      .eq('status', 'live')
      .select(`
        *,
        players (*),
        teams:current_bid_team_id (*)
      `)
      .single();

    if (error) throw error;

    res.json({ message: 'Bid placed successfully', round });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

/**
 * POST /api/auction/update-bid
 * Update current bid amount (admin only) - for corrections
 */
router.post('/update-bid', authenticate, authorizeAdmin, [
  body('round_id').notEmpty().withMessage('Round ID is required'),
  body('amount').isNumeric().withMessage('Bid amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { round_id, amount } = req.body;

    const { data: round, error } = await supabaseAdmin
      .from('auction_rounds')
      .update({ current_bid: amount })
      .eq('id', round_id)
      .eq('status', 'live')
      .select(`
        *,
        players (*),
        teams:current_bid_team_id (*)
      `)
      .single();

    if (error) throw error;

    res.json({ message: 'Bid updated successfully', round });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({ error: 'Failed to update bid' });
  }
});

/**
 * POST /api/auction/sell
 * Mark player as sold (admin only)
 */
router.post('/sell', authenticate, authorizeAdmin, [
  body('round_id').notEmpty().withMessage('Round ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { round_id } = req.body;

    // Get current round
    const { data: round, error: roundError } = await supabaseAdmin
      .from('auction_rounds')
      .select('*')
      .eq('id', round_id)
      .single();

    if (roundError || !round) {
      return res.status(404).json({ error: 'Auction round not found' });
    }

    if (!round.current_bid_team_id) {
      return res.status(400).json({ error: 'No team has bid on this player' });
    }

    // Update auction round status
    await supabaseAdmin
      .from('auction_rounds')
      .update({ status: 'completed' })
      .eq('id', round_id);

    // Update player as sold
    await supabaseAdmin
      .from('players')
      .update({
        status: 'sold',
        sold_to_team_id: round.current_bid_team_id,
        sold_price: round.current_bid
      })
      .eq('id', round.player_id);

    // Add player to team
    await supabaseAdmin
      .from('team_players')
      .insert({
        team_id: round.current_bid_team_id,
        player_id: round.player_id,
        price: round.current_bid,
        is_retained: false
      });

    // Deduct from team purse
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('purse_remaining')
      .eq('id', round.current_bid_team_id)
      .single();

    await supabaseAdmin
      .from('teams')
      .update({ purse_remaining: team.purse_remaining - round.current_bid })
      .eq('id', round.current_bid_team_id);

    res.json({ message: 'Player sold successfully' });
  } catch (error) {
    console.error('Sell player error:', error);
    res.status(500).json({ error: 'Failed to sell player' });
  }
});

/**
 * POST /api/auction/unsold
 * Mark player as unsold (admin only)
 */
router.post('/unsold', authenticate, authorizeAdmin, [
  body('round_id').notEmpty().withMessage('Round ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { round_id } = req.body;

    // Get current round
    const { data: round, error: roundError } = await supabaseAdmin
      .from('auction_rounds')
      .select('*')
      .eq('id', round_id)
      .single();

    if (roundError || !round) {
      return res.status(404).json({ error: 'Auction round not found' });
    }

    // Update auction round status
    await supabaseAdmin
      .from('auction_rounds')
      .update({ status: 'completed' })
      .eq('id', round_id);

    // Update player as unsold
    await supabaseAdmin
      .from('players')
      .update({ status: 'unsold' })
      .eq('id', round.player_id);

    res.json({ message: 'Player marked as unsold' });
  } catch (error) {
    console.error('Mark unsold error:', error);
    res.status(500).json({ error: 'Failed to mark player as unsold' });
  }
});

/**
 * POST /api/auction/reset
 * Reset entire auction (admin only)
 */
router.post('/reset', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Delete all auction rounds
    await supabaseAdmin
      .from('auction_rounds')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all team_players (except retained)
    await supabaseAdmin
      .from('team_players')
      .delete()
      .eq('is_retained', false);

    // Reset all players to not_started (except retained)
    await supabaseAdmin
      .from('players')
      .update({
        status: 'not_started',
        sold_to_team_id: null,
        sold_price: null
      })
      .neq('status', 'sold');

    // Reset team purses
    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('id, purse_start');

    for (const team of teams || []) {
      // Calculate retained player costs
      const { data: retained } = await supabaseAdmin
        .from('team_players')
        .select('price')
        .eq('team_id', team.id)
        .eq('is_retained', true);

      const retainedCost = (retained || []).reduce((sum, p) => sum + parseFloat(p.price), 0);

      await supabaseAdmin
        .from('teams')
        .update({ purse_remaining: team.purse_start - retainedCost })
        .eq('id', team.id);
    }

    res.json({ message: 'Auction reset successfully' });
  } catch (error) {
    console.error('Reset auction error:', error);
    res.status(500).json({ error: 'Failed to reset auction' });
  }
});

module.exports = router;
