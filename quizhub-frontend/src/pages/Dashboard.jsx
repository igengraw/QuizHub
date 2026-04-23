import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Гость';
  const token = localStorage.getItem('token');
  const isGuest = !token;

  // Постоянно получаем ID текущего пользователя для сравнения и запросов
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const currentUserId = user?.userId || user?.id || localStorage.getItem('userId');

  const [userStats, setUserStats] = useState({ passed: 0, created: 0 }); 
  const [quizzes, setQuizzes] = useState([]); // Используем одно название для списка
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('public');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin'; // Проверяем роль из базы



  // 1. Загрузка статистики для шапки
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUserId || isGuest) return;
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/user-stats?userId=${currentUserId}`);
        const data = await response.json();
        if (response.ok) setUserStats(data);
      } catch (e) { 
        console.error("Ошибка статистики:", e); 
      }
    };
    fetchStats();
  }, [currentUserId, isGuest]); 

  // 2. Универсальная загрузка квизов (Глобальные или Мои)
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      let url;
      const searchParam = searchTerm ? `&search=${searchTerm}` : '';

      if (view === 'my') {
        url = `http://localhost:5000/api/quizzes/my?userId=${currentUserId}${searchParam}`;
      } else if (view === 'admin') {
        url = `http://localhost:5000/api/quizzes/admin/all?search=${searchTerm}`;
      } else {
        url = `http://localhost:5000/api/quizzes/public?userId=${currentUserId || ''}${searchParam}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    fetchQuizzes();
      }, 500); // Поиск сработает через 0.5 сек после того, как пользователь перестанет печатать

      return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

  useEffect(() => {
    fetchQuizzes();
  }, [view]);

  const deleteQuiz = async (quizId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот квиз?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });
        if (response.ok) fetchQuizzes();
      } catch (error) {
        console.error("Ошибка при удалении:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">QuizHub</h1>
            {!isGuest && (
              <div className="flex gap-3 text-[10px] mt-1 font-bold uppercase tracking-wider">
                <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Создано: {userStats.created}</span>
                <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded">Пройдено: {userStats.passed}</span>
              </div>
            )}
          </div>
          <h1 className="text-lg font-medium text-gray-700">Привет, {username}!</h1>
          <button onClick={handleLogout} className="bg-gray-100 text-red-500 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all">
            Выйти
          </button>
        </div>
      </nav>
      
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* Переключатель вкладок */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button onClick={() => setView('public')} className={`pb-4 text-lg font-semibold ${view === 'public' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-400'}`}>
            Глобальная лента 🌍
          </button>
          
          {!isGuest && (
            <button onClick={() => setView('my')} className={`pb-4 text-lg font-semibold ${view === 'my' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>
              Моя студия 🛠️
            </button>
          )}

          {/* ВКЛАДКА АДМИНА */}
          {isAdmin && (
            <button onClick={() => setView('admin')} className={`pb-4 text-lg font-semibold ${view === 'admin' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}>
              Админ-панель 🛡️
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="relative w-full max-w-xl mb-8">
              <input 
                type="text"
                placeholder="Поиск по названию викторины..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ring-offset-0 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{view === 'public' ? 'Все викторины' : 'Мои инструменты'}</h2>
            <p className="text-gray-500">{view === 'public' ? 'Проходи тесты от других пользователей' : 'Управляйте своими викторинами'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="text-gray-500 italic">Загрузка викторин...</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative hover:shadow-md transition-shadow">
                
                {/* ПЛАШКА С ЛИЧНЫМ РЕКОРДОМ (если есть) */}
                {quiz.my_best_score !== null && Number(quiz.creator_id) !== Number(currentUserId) && (
                  <div className="absolute bottom-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 shadow-sm animate-in fade-in zoom-in duration-300">
                    Ваш результат: {quiz.my_best_score} / {quiz.questions_count}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-g  reen-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase">
                    {view === 'public' ? 'Открытый' : 'Активен'}
                  </div>
                  <span className="text-gray-400 text-sm">{quiz.questions_count || 0} вопросов</span>
                </div>

                <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">{quiz.title}</h3>
                
                {view === 'public' && quiz.author_name && (
                   <p className="text-blue-500 text-xs mb-1">Автор: {quiz.author_name}</p>
                )}

                <p className="text-gray-600 text-sm font-medium mb-1">
                  Прошли: <span className="text-blue-600">{quiz.attempts_count || 0}</span> раз(а)
                </p>

                <p className="text-gray-400 text-xs mb-6">Создан: {new Date(quiz.created_at).toLocaleDateString()}</p>
                
                <div className="flex gap-2">
                  {/* ЛОГИКА КНОПКИ: Начало или блокировка */}
                  {Number(quiz.creator_id) === Number(currentUserId) ? (
                    <button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed border border-gray-200 text-sm">
                      Ваш квиз
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/quiz/${quiz.id}`)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
                      Начать
                    </button>
                  )}
                  {/* 2. Кнопка ИЗМЕНИТЬ (Только во вкладке "Моя студия") */}
                  {view === 'my' && (
                    <button 
                      onClick={() => navigate(`/edit-quiz/${quiz.id}`)} 
                      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      Изменить
                    </button>
                  )}
                  {isAdmin && view === 'admin' && (
                    <button 
                      onClick={() => navigate(`/view-quiz/${quiz.id}`)} 
                      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Просмотр
                    </button>
                  )}

                  {(view === 'my' || (isAdmin && view === 'admin')) && (
                    <button 
                      onClick={() => deleteQuiz(quiz.id)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-100"
                      title="Удалить квиз"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {!loading && view === 'my' && (
            <div onClick={() => navigate('/create-quiz')} className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-white hover:border-blue-400 transition-all group">
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