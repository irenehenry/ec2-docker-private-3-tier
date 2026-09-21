const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Create connection pool to RDS
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Health check + Database test
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    res.json({
      status: 'Backend is healthy',
      database: 'Connected to RDS',
      current_time: result.rows[0].current_time,
      message: 'Data is coming from Amazon RDS'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Backend is running',
      database: 'Failed to connect to RDS',
      error: error.message
    });
  }
});

// Create a simple table and insert test data
app.get('/api/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      INSERT INTO visitors (name) VALUES ('Test User from EC2')
    `);

    res.json({ message: 'Table created and test data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get data from RDS
app.get('/api/visitors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY id DESC LIMIT 10');
    res.json({
      message: 'Data fetched from Amazon RDS',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running and connected to RDS');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});