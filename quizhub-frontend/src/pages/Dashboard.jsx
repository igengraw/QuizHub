import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Гость';
  // Пример данных (в будущем они будут приходить из базы данных PostgreSQL)
  const myQuizzes = [
    { id: 1, title: 'Основы React', questionsCount: 10, attempts: 25 },
    { id: 2, title: 'JavaScript для начинающих', questionsCount: 15, attempts: 42 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигационная панель */}
      <nav className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">QuizHub</h1>
          <h1 className="text-3xl font-bold">Добро пожаловать, {username}!</h1>
          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Все тесты
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>
      
      {/* Основной контент */}
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Моя панель</h2>
            <p className="text-gray-500">Управляйте своими викторинами и просматривайте статистику</p>
          </div>
          <button 
            onClick={() => navigate('/create-quiz')} // ВОТ ЭТО ДОБАВЬ
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 ..."
>
            + Создать новый квиз
          </button>
        </div>

        {/* Сетка с карточками квизов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">
                  Active
                </div>
                <span className="text-gray-400 text-sm">{quiz.questionsCount} вопросов</span>
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">{quiz.title}</h3>
              <p className="text-gray-500 text-sm mb-6">Прошли: {quiz.attempts} раз(а)</p>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Статистика
                </button>
                <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Изменить
                </button>
              </div>
            </div>
          ))}

          {/* Пустая карточка (заглушка для добавления) */}
          <div 
            onClick={() => navigate('/create-quiz')}
            className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100">
              <span className="text-3xl text-gray-400 group-hover:text-blue-500">+</span>
            </div>
            <p className="text-gray-500 font-medium group-hover:text-blue-500">Добавить тест</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;