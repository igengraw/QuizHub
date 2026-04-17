import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Лог для проверки: загружается ли роут
console.log('--- Подключение маршрутов ---');
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes); // Перенесли сюда для порядка
console.log('✅ Маршруты /api/auth подключены');

app.get('/', (req, res) => {
  res.send('Сервер QuizHub работает! 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер: http://localhost:${PORT}`);
});