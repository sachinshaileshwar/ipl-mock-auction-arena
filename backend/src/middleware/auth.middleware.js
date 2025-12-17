const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Authentication middleware - validates JWT token from Supabase
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token with Supabase
    // Note: getUser is an auth method, so we still use standard client or admin auth
    // Using standard client validates the token signature and expiration against the project
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Admin authorization middleware - checks if user has admin role
 */
const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user profile to check role
    // Use supabaseAdmin to bypass RLS policies
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Unable to verify user role' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = profile.role;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Team authorization middleware - checks if user belongs to a team
 */
const authorizeTeam = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, team_id')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Unable to verify user profile' });
    }

    if (profile.role !== 'team' || !profile.team_id) {
      return res.status(403).json({ error: 'Team member access required' });
    }

    req.userRole = profile.role;
    req.teamId = profile.team_id;
    next();
  } catch (error) {
    console.error('Team authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

module.exports = { authenticate, authorizeAdmin, authorizeTeam };
