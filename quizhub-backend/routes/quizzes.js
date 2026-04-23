import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/public', async (req, res) => {
    try {
        const { userId, search } = req.query; // Получаем поисковый запрос

        let queryText = `
            SELECT 
                q.*, 
                u.username as author_name,
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as attempts_count,
                (SELECT MAX(score) FROM results WHERE quiz_id = q.id AND user_id = $1) as my_best_score
            FROM quizzes q
            JOIN users u ON q.creator_id = u.id
        `;

        const params = [userId || null];

        // Если пришел поисковый запрос, добавляем фильтрацию
        if (search) {
            queryText += ` WHERE q.title ILIKE $2 `;
            params.push(`%${search}%`); // Символы % позволяют искать внутри строки
        }

        queryText += ` ORDER BY q.created_at DESC `;

        const result = await pool.query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка поиска" });
    }
});

router.get('/my', async (req, res) => {
    try {
        const { userId, search } = req.query;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "Необходим корректный userId" });
        }

        let queryText = `
            SELECT 
                q.*, 
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as attempts_count
            FROM quizzes q
            WHERE q.creator_id = $1
        `;

        const params = [userId];

        // Добавляем поиск, если он есть
        if (search) {
            queryText += ` AND q.title ILIKE $2 `;
            params.push(`%${search}%`);
        }

        queryText += ` ORDER BY q.created_at DESC `;

        const result = await pool.query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка в /my:", err.message);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получить ВСЕ квизы для панели администратора
router.get('/admin/all', async (req, res) => {
    try {
        const { search } = req.query;

        let queryText = `
            SELECT 
                q.*, 
                u.username as author_name,
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as attempts_count
            FROM quizzes q
            JOIN users u ON q.creator_id = u.id
        `;

        const params = [];

        if (search) {
            queryText += ` WHERE q.title ILIKE $1 `;
            params.push(`%${search}%`);
        }

        queryText += ` ORDER BY q.created_at DESC `;

        const result = await pool.query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка админ-панели:", err.message);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

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

router.get('/user-stats', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "userId required" });

        // 1. Считаем созданные (тут всё остается так же)
        const createdRes = await pool.query(
            'SELECT COUNT(*) FROM quizzes WHERE creator_id = $1',
            [userId]
        );

        // 2. ИСПРАВЛЕНО: Считаем только УНИКАЛЬНЫЕ пройденные квизы
        // Добавляем DISTINCT quiz_id
        const passedRes = await pool.query(
            'SELECT COUNT(DISTINCT quiz_id) FROM results WHERE user_id = $1',
            [userId]
        );

        res.json({
            created: parseInt(createdRes.rows[0].count),
            passed: parseInt(passedRes.rows[0].count)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);
        const questions = await pool.query('SELECT * FROM questions WHERE quiz_id = $1', [id]);

        if (quiz.rows.length === 0) return res.status(404).json({ message: "Квиз не найден" });

        res.json({
            title: quiz.rows[0].title,
            questions: questions.rows.map(q => {
                // Превращаем JSON-строку из базы в массив JS
                const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                return {
                    // ПЕРЕИМЕНОВЫВАЕМ ЗДЕСЬ: из базы (question_text) -> во фронтенд (questionText)
                    questionText: q.question_text, 
                    options: opts,
                    // Находим индекс правильного ответа
                    correctAnswer: opts.indexOf(q.correct_answer)
                };
            })
        });
    } catch (err) {
        console.error("Ошибка в GET /edit:", err.message);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// 2. ВОПРОСЫ ДЛЯ ИГРОКА (ТОТ САМЫЙ РОУТ, КОТОРОГО НЕ ХВАТАЛО)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Защита: если id - не число, пропускаем этот роут
        if (isNaN(id)) return res.status(400).json({ message: "Некорректный ID" });

        const result = await pool.query(
            'SELECT * FROM questions WHERE quiz_id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Вопросы для этого квиза не найдены" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка при загрузке вопросов:", err.message);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}); 

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, questions } = req.body;

        console.log("DEBUG: Получены данные для обновления:", { title, questionsCount: questions?.length });

        await pool.query('UPDATE quizzes SET title = $1 WHERE id = $2', [title, id]);

        await pool.query('DELETE FROM questions WHERE quiz_id = $1', [id]);

        for (const q of questions) {
            const qText = q.question_text || q.questionText;
            
            let correctAnswer = q.correct_answer || q.correctAnswer;
            if (typeof correctAnswer === 'number') {
                correctAnswer = q.options[correctAnswer];
            }

            if (!qText) {
                console.error("DEBUG: Пропущен вопрос без текста!", q);
                continue; 
            }

            await pool.query(
                'INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
                [id, qText, JSON.stringify(q.options), correctAnswer]
            );
        }

        res.json({ message: "Викторина успешно обновлена!" });
    } catch (err) {

        console.error("КРИТИЧЕСКАЯ ОШИБКА БЭКЕНДА:", err.message);
        res.status(500).json({ message: "Ошибка сервера при сохранении", error: err.message });
    }
});

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

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Сначала удаляем результаты этого квиза (чтобы счетчик уменьшился)
        await pool.query('DELETE FROM results WHERE quiz_id = $1', [id]);

        // 2. Удаляем вопросы
        await pool.query('DELETE FROM questions WHERE quiz_id = $1', [id]);

        // 3. Удаляем сам квиз
        await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);

        res.json({ message: "Викторина и её результаты удалены" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Ошибка при удалении" });
    }
});

export default router;