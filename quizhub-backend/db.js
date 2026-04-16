import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  // Теперь сервер сам возьмет ссылку из .env
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const checkConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ База данных Supabase подключена через .env!');
  } catch (err) {
    console.error('❌ Ошибка подключения:', err.message);
  }
};

checkConnection();

export default pool;