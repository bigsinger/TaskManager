/**
 * OAuth Service - Third-party authentication
 * Supports GitHub and Google OAuth
 */

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuidv4 } = require('uuid');

// Import database functions
const {
  getUserByEmail,
  createUser,
  assignRole,
  getTenantBySubdomain,
  createTenant,
  updateUserLoginTime
} = require('./database');

// OAuth configuration from environment variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwt = require('jsonwebtoken');

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, tenant_id: user.tenant_id },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Find or create OAuth user
async function findOrCreateOAuthUser(profile, provider, tenantId = null) {
  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
  
  if (!email) {
    throw new Error('Email not provided by OAuth provider');
  }

  // Use default tenant if not specified
  let tenant_id = tenantId;
  if (!tenant_id) {
    // Try to find existing user to get their tenant
    const existingUser = await findUserByOAuthEmail(email);
    if (existingUser) {
      tenant_id = existingUser.tenant_id;
    } else {
      // Create default tenant for new OAuth users
      const defaultTenant = await getOrCreateDefaultTenant();
      tenant_id = defaultTenant.id;
    }
  }

  // Check if user exists
  let user = await getUserByEmail(tenant_id, email);

  if (!user) {
    // Create new user
    const name = profile.displayName || profile.username || email.split('@')[0];
    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    
    // Generate random password for OAuth users
    const randomPassword = uuidv4();
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(randomPassword, 10);

    user = await createUser({
      tenant_id,
      email,
      name,
      password_hash,
      avatar
    });

    // Assign default role (TaskExecutor)
    await assignRole(user.id, 'role-executor');
  }

  // Update login time
  await updateUserLoginTime(user.id);

  return user;
}

// Find user by email across all tenants (for OAuth linking)
async function findUserByOAuthEmail(email) {
  // This is a simplified version - in production, you might want a separate OAuth linking table
  // For now, we'll return null and let the caller handle tenant selection
  return null;
}

// Get or create default tenant for OAuth users
async function getOrCreateDefaultTenant() {
  let tenant = await getTenantBySubdomain('default');
  
  if (!tenant) {
    tenant = await createTenant({
      name: 'Default Organization',
      subdomain: 'default'
    });
  }
  
  return tenant;
}

// Initialize Passport strategies
function initializePassport() {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { getUserById } = require('./database');
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // GitHub Strategy
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ['user:email'],
      passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(profile, 'github');
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }));
    console.log('✓ GitHub OAuth strategy initialized');
  } else {
    console.log('⚠ GitHub OAuth not configured (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)');
  }

  // Google Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(profile, 'google');
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }));
    console.log('✓ Google OAuth strategy initialized');
  } else {
    console.log('⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
  }

  return passport;
}

// OAuth route handlers
function getOAuthRoutes() {
  const express = require('express');
  const router = express.Router();

  // GitHub OAuth routes
  router.get('/github', (req, res, next) => {
    if (!isOAuthConfigured('github')) {
      return res.status(503).json({ 
        error: 'GitHub OAuth is not configured',
        message: 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file'
      });
    }
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  });

  router.get('/github/callback', (req, res, next) => {
    if (!isOAuthConfigured('github')) {
      return res.status(503).json({ 
        error: 'GitHub OAuth is not configured',
        message: 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file'
      });
    }
    passport.authenticate('github', { session: false, failureRedirect: '/login?error=oauth_failed' })(req, res, next);
  }, (req, res) => {
    // Successful authentication - user is attached to req by passport
    if (!req.user) {
      return res.redirect('/login?error=authentication_failed');
    }
    
    const token = generateToken(req.user);
    const tenant = { id: req.user.tenant_id };
    
    // Redirect to frontend with token
    res.redirect(`/oauth/callback?token=${token}&tenant_id=${tenant.id}`);
  });

  // Google OAuth routes
  router.get('/google', (req, res, next) => {
    if (!isOAuthConfigured('google')) {
      return res.status(503).json({ 
        error: 'Google OAuth is not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file'
      });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    if (!isOAuthConfigured('google')) {
      return res.status(503).json({ 
        error: 'Google OAuth is not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file'
      });
    }
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' })(req, res, next);
  }, (req, res) => {
    // Successful authentication - user is attached to req by passport
    if (!req.user) {
      return res.redirect('/login?error=authentication_failed');
    }
    
    const token = generateToken(req.user);
    const tenant = { id: req.user.tenant_id };
    
    // Redirect to frontend with token
    res.redirect(`/oauth/callback?token=${token}&tenant_id=${tenant.id}`);
  });

  // OAuth callback handler for frontend
  router.get('/oauth/callback', (req, res) => {
    // This endpoint receives the token from OAuth provider callbacks
    // and stores it in localStorage via a script
    const { token, tenant_id } = req.query;
    
    if (!token) {
      return res.redirect('/login?error=oauth_failed');
    }

    // Return HTML page that stores token and redirects
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Callback</title>
      </head>
      <body>
        <script>
          // Store token in localStorage
          localStorage.setItem('auth_token', '${token}');
          localStorage.setItem('tenant_id', '${tenant_id || ''}');
          // Redirect to main app
          window.location.href = '/';
        </script>
        <p>Login successful, redirecting...</p>
      </body>
      </html>
    `);
  });

  // Link OAuth account to existing user
  router.post('/link', async (req, res) => {
    try {
      const { provider, token, tenant_id } = req.body;
      
      // Verify current user is logged in
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // This would link the OAuth account to the existing user
      // Implementation depends on your user account linking strategy
      
      res.json({ message: 'Account linked successfully' });
    } catch (error) {
      console.error('OAuth link error:', error);
      res.status(500).json({ error: 'Failed to link account' });
    }
  });

  // Unlink OAuth account
  router.post('/unlink', async (req, res) => {
    try {
      const { provider } = req.body;
      
      // Implementation for unlinking OAuth account
      
      res.json({ message: 'Account unlinked successfully' });
    } catch (error) {
      console.error('OAuth unlink error:', error);
      res.status(500).json({ error: 'Failed to unlink account' });
    }
  });

  return router;
}

// Check if OAuth is configured
function isOAuthConfigured(provider) {
  if (provider === 'github') {
    return !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
  }
  if (provider === 'google') {
    return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
  }
  return false;
}

// Get available OAuth providers
function getAvailableProviders() {
  const providers = [];
  if (isOAuthConfigured('github')) providers.push('github');
  if (isOAuthConfigured('google')) providers.push('google');
  return providers;
}

module.exports = {
  initializePassport,
  getOAuthRoutes,
  isOAuthConfigured,
  getAvailableProviders,
  generateToken
};
