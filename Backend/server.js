const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 4000;
const SECRET_KEY = "my_jwt_secret_key"; // ⚠️ Use .env in production

app.use(express.json());
app.use(cors());

// ===================== DATABASE SETUP =====================
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Connected to SQLite database.');
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// ===================== DEFAULT HOME ROUTE =====================
// This is what you see when visiting http://localhost:4000
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 JWT Authentication API</h1>
    <p>Welcome! Your backend server is running.</p>
    <ul>
      <li>POST <code>/signup</code> — Create a new user</li>
      <li>POST <code>/login</code> — Authenticate user and get JWT</li>
      <li>GET <code>/profile</code> — Access protected route (requires token)</li>
    </ul>
  `);
});

// ===================== HEALTH CHECK ROUTE =====================
// For CI/CD, Docker, or uptime monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===================== SIGNUP =====================
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, hashedPassword],
    function (err) {
      if (err) {
        console.error('❌ Signup error:', err.message);
        return res.status(400).json({ message: 'User already exists!' });
      }
      res.status(201).json({ message: 'Signup successful!' });
    }
  );
});

// ===================== LOGIN =====================
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ message: 'User not found!' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Invalid password!' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token });
  });
});

// ===================== PROTECTED PROFILE ROUTE =====================
app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token required!' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    db.get(`SELECT username, email FROM users WHERE id = ?`, [decoded.id], (err, user) => {
      if (err || !user) return res.status(404).json({ message: 'User not found' });
      res.json({ user });
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token!' });
  }
});

// ===================== START SERVER =====================
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
