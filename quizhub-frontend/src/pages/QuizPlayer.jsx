import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const QuizPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`http://localhost:5000/api/quizzes/${id}`);
      const data = await response.json();
      setQuestions(data);
    };
    fetchQuestions();
  }, [id]);

  const handleAnswer = async (option) => {
    let currentScore = score;
    
    if (option === questions[currentQuestion].correct_answer) {
      currentScore = score + 1;
      setScore(currentScore);
    }

    const nextQuestion = currentQuestion + 1;

    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
      
      // ИСПРАВЛЕННЫЙ БЛОК ПОЛУЧЕНИЯ ID
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Проверяем все возможные варианты: userId (из токена), id или напрямую из localStorage
      const actualUserId = user?.userId || user?.id || localStorage.getItem('userId');

      try {
        await fetch('http://localhost:5000/api/quizzes/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: id,
            userId: actualUserId || null, // Если ID найден, он отправится в базу
            score: currentScore,
            totalQuestions: questions.length
          })
        });
        console.log("Статистика сохранена для пользователя ID:", actualUserId || "Гость");
      } catch (error) {
        console.error("Не удалось сохранить результат:", error);
      }
    }
  };

  if (questions.length === 0) return <div className="p-10 text-center">Загрузка вопросов...</div>;

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4">Результат 🎉</h2>
          <p className="text-5xl font-extrabold text-blue-600 mb-6">{score} / {questions.length}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
          >
            Вернуться в панель
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
  <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    {/* Анимация прогресс-бара и заголовка (по желанию) */}
    <div className="w-full max-w-2xl mt-10">
       {/* Контейнер для анимации смены вопросов */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion} // Важный ключ для срабатывания анимации
          initial={{ x: 100, opacity: 0 }} // Появляется справа (x: 100)
          animate={{ x: 0, opacity: 1 }}    // Встает в центр
          exit={{ x: -100, opacity: 0 }}   // Уходит влево
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-black text-blue-600 uppercase tracking-widest">
              Вопрос {currentQuestion + 1} / {questions.length}
            </span>
            <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-tight">
            {q.question_text}
          </h2>

          <div className="grid gap-4">
            {q.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-5 border-2 border-gray-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold text-gray-700"
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
);
};

export default QuizPlayer;