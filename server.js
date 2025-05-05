// server.js
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();
const DATA_FILE = path.join(__dirname, 'users.json');

// JSON body parser
app.use(express.json());

// Session & Passport
app.use(session({
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Storage Helpers ---
function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}
function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}
function findByEmail(email) {
  return loadUsers().find(u => u.email === email);
}
function findByProvider(provider, id) {
  return loadUsers().find(u => u.provider === provider && u.providerId === id);
}
function createUser(user) {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

// --- Passport Local-like for GitHub ---
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = loadUsers().find(u => u.id === id);
  done(null, user || null);
});

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  "http://localhost:3000/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = findByProvider('github', profile.id);
      if (!user) {
        // create new user
        user = {
          id:             Date.now().toString(),
          provider:       'github',
          providerId:     profile.id,
          email:          profile.emails?.[0]?.value || null,
          firstName:      profile.username,
          lastName:       '',
        };
        createUser(user);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

// --- Routes ---

// Local Register
app.post('/api/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (findByEmail(email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const newUser = {
    id:         Date.now().toString(),
    provider:   'local',
    providerId: null,
    firstName, lastName, email, password
  };
  createUser(newUser);
  res.json({ message: 'Registration successful' });
});

// Local Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = findByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful' });
});

// GitHub OAuth start
app.get('/api/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub OAuth callback
app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Başarılı olursa frontend’in /home sayfasına yönlensin
    res.redirect('/home');
  }
);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
