import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 1. Глобальная лента (С подтянутой статистикой)
router.get('/public', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                q.*, 
                u.username as author_name,
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as attempts_count
            FROM quizzes q
            JOIN users u ON q.creator_id = u.id
            ORDER BY q.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка в /public:", err.message);
        res.status(500).json({ message: "Ошибка загрузки ленты" });
    }
});

// 2. Мои квизы (Объединенный роут со статистикой)
router.get('/my', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "Необходим корректный userId" });
        }

        const result = await pool.query(`
            SELECT 
                q.*, 
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as attempts_count
            FROM quizzes q
            WHERE q.creator_id = $1
            ORDER BY q.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка в /my:", err.message);
        res.status(500).json({ message: "Ошибка сервера при получении статистики" });
    }
});

// 3. Сохранение результата (Важно: POST должен быть до GET /:id)
router.post('/results', async (req, res) => {
    try {
        const { quizId, userId, score, totalQuestions } = req.body;
        await pool.query(
            'INSERT INTO results (quiz_id, user_id, score, total_questions) VALUES ($1, $2, $3, $4)',
            [quizId, userId, score, totalQuestions]
        );
        res.status(201).json({ message: "Результат сохранен!" });
    } catch (err) {
        console.error("Ошибка сохранения результата:", err.message);
        res.status(500).json({ message: "Не удалось сохранить результат" });
    }
});

// Получение общей статистики пользователя: GET /api/quizzes/user-stats
router.get('/user-stats', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "userId required" });

        // 1. Считаем сколько квизов создал пользователь
        const createdRes = await pool.query(
            'SELECT COUNT(*) FROM quizzes WHERE creator_id = $1',
            [userId]
        );

        // 2. Считаем сколько раз пользователь проходил любые квизы
        const passedRes = await pool.query(
            'SELECT COUNT(*) FROM results WHERE user_id = $1',
            [userId]
        );

        res.json({
            created: parseInt(createdRes.rows[0].count),
            passed: parseInt(passedRes.rows[0].count)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка сервера при подсчете статистики" });
    }
});

// 4. Вопросы конкретного квиза (Динамический ID всегда в самом конце списка GET)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Если кто-то случайно дернет этот роут со строкой вместо ID
        if (isNaN(id)) return res.status(400).json({ message: "Некорректный ID" });

        const result = await pool.query(
            'SELECT * FROM questions WHERE quiz_id = $1',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка при загрузке вопросов" });
    }
});

// 5. Создание квиза
router.post('/', async (req, res) => {
    try {
        const { title, questions, creatorId } = req.body;
        const quizResult = await pool.query(
            'INSERT INTO quizzes (title, creator_id) VALUES ($1, $2) RETURNING id',
            [title, creatorId]
        );
        const quizId = quizResult.rows[0].id;

        for (const q of questions) {
            await pool.query(
                'INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
                [quizId, q.questionText, JSON.stringify(q.options), q.options[q.correctAnswer]]
            );
        }
        res.status(201).json({ message: "Викторина создана!", quizId });
    } catch (err) {
        res.status(500).json({ message: "Ошибка при создании" });
    }
});

// 6. Удаление
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM questions WHERE quiz_id = $1', [id]);
        await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);
        res.json({ message: "Викторина удалена" });
    } catch (err) {
        res.status(500).json({ message: "Ошибка при удалении" });
    }
});

export default router;