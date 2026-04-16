import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Только один раз
app.use(express.json()); // Обязательно ПЕРЕД роутами

// Роуты
app.use('/api/auth', authRoutes);

// Тестовые маршруты
app.get('/', (req, res) => {
  res.send('Сервер QuizHub работает! 🚀');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "База данных отвечает!", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`=========================================`);
});