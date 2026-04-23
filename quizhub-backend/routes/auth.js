import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = express.Router();

// Маршрут регистрации
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Хешируем пароль (для безопасности)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Сохраняем пользователя в Supabase
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );

        res.status(201).json({ 
            message: "Пользователь успешно создан!",
            user: newUser.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка при регистрации. Возможно, email уже занят." });
    }
});

import jwt from 'jsonwebtoken'; 

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Вход выполнен успешно",
            token,
            userId: user.id, 
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка сервера при входе" });
    }
});

export default router;