const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * User login with email/username and password
 */
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Get email from username using database function
    const { data: email, error: emailError } = await supabase
      .rpc('get_email_by_username', { _username: username });

    if (emailError || !email) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Fetch user profile
    // Use supabaseAdmin to bypass RLS since we just verified credentials
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, teams(*)')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
      profile
    });
  } catch (error) {
    console.error('Login error:', error);
    // Expose detailed error for Vercel debugging
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').notEmpty().withMessage('Username is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username, role = 'team', team_id } = req.body;

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
          team_id
        }
      }
    });

    if (error) {
      // Handle Supabase Auth duplicate error
      if (error.message === 'User already registered') {
        return res.status(400).json({ error: 'This email is already registered' });
      }

      // Handle Database unique violations (Profile trigger)
      if (error.code === '23505' || (error.message && error.message.includes('duplicate key'))) {
        const field = error.message.includes('username') ? 'Username' : 'Email';
        return res.status(400).json({ error: `${field} is already taken` });
      }

      return res.status(400).json({ error: error.message || 'Signup failed due to server error' });
    }

    // Check if user exists (identities logic for certain Supabase configs)
    if (data?.user?.identities?.length === 0) {
      return res.status(400).json({ error: 'This email is already registered' });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: data.user
    });
  } catch (error) {
    console.error('Signup error:', error);
    // Expose detailed error for Vercel debugging
    res.status(500).json({ error: error.message || 'Internal server error during signup' });
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, teams(*)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user: req.user, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * POST /api/auth/create-team-user
 * Admin creates user for a team (uses service role)
 */
router.post('/create-team-user', authenticate, async (req, res) => {
  try {
    const { username, password, team_id } = req.body;

    // Check if Service Role Key is configured (heuristic)
    const isServiceKeyConfigured = process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key';

    if (!isServiceKeyConfigured) {
      console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in backend/.env');
      return res.status(500).json({
        error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY. Cannot create team users.'
      });
    }

    // Check if we are updating an existing user
    if (req.body.update_existing) {
      // 1. Find user by username/email first
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (profileError || !profiles) {
        return res.status(404).json({ error: 'User not found to update' });
      }

      // 2. Update password
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profiles.id,
        { password: password }
      );

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({
        message: 'Team credentials updated successfully',
        user: updatedUser.user
      });
    }

    // Create user with admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@auction.local`,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role: 'team',
        team_id
      }
    });

    if (error) {
      // If user already exists, try to update them
      if (error.message.includes('already registered')) {
        // Find the profile to get the user ID
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (existingProfile) {
          // Update the existing user's password and metadata
          const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingProfile.id,
            {
              password: password,
              user_metadata: {
                username,
                role: 'team',
                team_id
              }
            }
          );

          // Update the profile's team_id as well
          await supabaseAdmin
            .from('profiles')
            .update({ team_id, role: 'team' })
            .eq('id', existingProfile.id);

          if (updateError) {
            return res.status(400).json({ error: 'Failed to update existing user: ' + updateError.message });
          }

          return res.status(200).json({
            message: 'Team user updated successfully',
            user: updatedUser.user
          });
        }
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Team user created successfully',
      user: data.user
    });
  } catch (error) {
    console.error('Create team user error:', error);
    res.status(500).json({ error: 'Failed to create team user' });
  }
});

module.exports = router;
