require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. LOGIN (Updated with Password & Specific User Logic)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // SPECIAL SIMULATION USER
    if (email === 'daveb_hvac@msn.com') {
      if (password === 'Secure@2026') {
        // We force-send this specific data without checking the DB for simplicity in simulation
        return res.json({
          user: { id: 999, email: email, name: "ROGER DAVID B." }, // Customer Name
          wallet: { balance: 12000.00, currency: 'GBP' }    // £12,000
        });
      } else {
        return res.status(401).json({ error: "Incorrect Password" });
      }
    }

    // NORMAL LOGIC (For any other user testing)
    let userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userRes.rows.length === 0) {
      // Auto-register others for testing
      const newUser = await pool.query('INSERT INTO users (email) VALUES ($1) RETURNING *', [email]);
      const userId = newUser.rows[0].id;
      await pool.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00)', [userId]);
      userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    }

    const user = userRes.rows[0];
    const walletRes = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [user.id]);

    // Default fallback if not the special user
    res.json({
      user: { ...user, name: "Valued Customer" },
      wallet: walletRes.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. GET DATA
app.get('/api/data/:userId', async (req, res) => {
  // If it's our special user (ID 999), return static data
  if (req.params.userId === '999') {
    return res.json({
      wallet: { balance: 12000.00, currency: 'GBP' },
      transactions: [
        { id: 1, type: 'DEPOSIT', amount: 12000.00, date: new Date().toISOString(), status: 'COMPLETED' }
      ]
    });
  }

  // Normal DB fetch for others
  try {
    const { userId } = req.params;
    const wallet = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    const txs = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
    res.json({ wallet: wallet.rows[0], transactions: txs.rows });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));