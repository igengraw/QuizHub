import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Гость';
  const token = localStorage.getItem('token');
  const isGuest = !token; // Проверка на гостя

  const [userStats, setUserStats] = useState({ passed: 0, created: 0 }); //для подсчета пройденных куизов в личном кабинете

  // Состояния для данных
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние текущей вкладки: 'public' (все куизы) или 'my' (только свои)
  const [view, setView] = useState('public');

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Извлекаем ID так же, как в других частях приложения
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const id = user?.userId || user?.id || localStorage.getItem('userId');

      // Если ID нет (гость), просто выходим
      if (!id || isGuest) return;

      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/user-stats?userId=${id}`);
        const data = await response.json();
        if (response.ok) {
          setUserStats(data);
        }
      } catch (e) { 
        console.error("Ошибка при загрузке статистики:", e); 
      }
    };

    fetchStats();
  }, [isGuest]); // Добавили isGuest в зависимости: если гость войдет, статистика обновится

  // Функция загрузки данных с учетом выбранной вкладки
  const fetchQuizzes = async () => {
  setLoading(true);
  try {
    let url = 'http://localhost:5000/api/quizzes/public';
    
    if (view === 'my') {
      // Ищем ID пользователя. Проверяем ключ 'user', затем 'userId'
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Пытаемся достать ID из разных возможных мест
      const id = user?.userId || user?.id || localStorage.getItem('userId'); 
      
      if (!id) {
        console.error("ID пользователя не найден. Проверьте localStorage.");
        setMyQuizzes([]);
        setLoading(false);
        return;
      }
      
      url = `http://localhost:5000/api/quizzes/my?userId=${id}`;
    }

    const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMyQuizzes(data);
      }
    } catch (error) {
      console.error("Ошибка при получении квизов:", error);
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления куиза
  const deleteQuiz = async (quizId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот квиз?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchQuizzes(); // Обновляем список после удаления
        }
      } catch (error) {
        console.error("Ошибка при удалении:", error);
      }
    }
  };

  // Перезагрузка данных при смене вкладки
  useEffect(() => {
    fetchQuizzes();
  }, [view]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигационная панель */}
      <nav className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">QuizHub</h1>
            
            {/* 3. ОТОБРАЖАЕМ СТАТИСТИКУ В ШАПКЕ */}
            {!isGuest && (
              <div className="flex gap-3 text-[10px] mt-1 font-bold uppercase tracking-wider">
                <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                  Создано: {userStats.created}
                </span>
                <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded">
                  Пройдено: {userStats.passed}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-lg font-medium text-gray-700">Привет, {username}!</h1>
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>
      
      {/* Основной контент */}
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        
        {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setView('public')}
            className={`pb-4 text-lg font-semibold transition-all ${
              view === 'public' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'
            }`}
          >
            Глобальная лента 🌍
          </button>
          
          {!isGuest && (
            <button 
              onClick={() => setView('my')}
              className={`pb-4 text-lg font-semibold transition-all ${
                view === 'my' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'
              }`}
            >
              Моя студия 🛠️
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {view === 'public' ? 'Все викторины' : 'Мои инструменты'}
            </h2>
            <p className="text-gray-500">
              {view === 'public' 
                ? 'Проходи тесты от других пользователей' 
                : 'Управляйте своими викторинами и просматривайте статистику'}
            </p>
          </div>
          
          {/* Кнопка создания с проверкой на гостя */}
          <button 
            onClick={() => {
              if (isGuest) {
                alert("Пожалуйста, войдите или зарегистрируйтесь, чтобы создавать квизы!");
                navigate('/login');
              } else {
                navigate('/create-quiz');
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            + Создать новый квиз
          </button>
        </div>

        {/* Сетка с карточками квизов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="text-gray-500 italic">Загрузка викторин...</p>
          ) : (
            myQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase">
                    {view === 'public' ? 'Открытый' : 'Активен'}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {quiz.questions_count || 0} вопросов
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{quiz.title}</h3>
                
                {/* Если в ленте, показываем автора */}
                {view === 'public' && quiz.author_name && (
                   <p className="text-blue-500 text-xs mb-1">Автор: {quiz.author_name}</p>
                )}

                {/* СТАТИСТИКА: сколько раз прошли куиз */}
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Прошли: <span className="text-blue-600">{quiz.attempts_count || 0}</span> раз(а)
                </p>

                <p className="text-gray-400 text-xs mb-6">
                  Создан: {new Date(quiz.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Начать
                  </button>

                  {/* Кнопки управления появляются ТОЛЬКО во вкладке "Моя студия" */}
                  {view === 'my' && (
                    <>
                      <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Изменить
                      </button>
                      <button 
                        onClick={() => deleteQuiz(quiz.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Карточка-кнопка добавления видна только авторизованным и во вкладке "Мои" */}
          {!loading && view === 'my' && (
            <div 
              onClick={() => navigate('/create-quiz')}
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-white hover:border-blue-400 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100">
                <span className="text-3xl text-gray-400 group-hover:text-blue-500">+</span>
              </div>
              <p className="text-gray-500 font-medium group-hover:text-blue-500">Добавить тест</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;