import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import pool from '../db.js';

const router = express.Router();

// 1. Маршрут регистрации
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Добавляем 'role' в RETURNING, чтобы сразу знать роль нового юзера (по умолчанию 'user')
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, passwordHash, 'user'] // При регистрации всегда даем роль 'user'
        );

        res.status(201).json({ 
            message: "Account created succesfully",
            user: newUser.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Registration error. Email might be already in use" });
    }
});

// 2. Маршрут входа
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Выбираем всё (включая колонку role)
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        // ВАЖНО: Добавляем role в токен (payload)
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // ВАЖНО: Отправляем role в объекте user на фронтенд
        res.json({
            message: "Logged in successfully",
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role // Теперь Dashboard.jsx увидит эту роль
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error while entering" });
    }
});

export default router;