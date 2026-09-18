const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});