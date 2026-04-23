import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    const creatorId = user?.userId || user?.id || localStorage.getItem('userId');

    console.log("DEBUG: Пытаюсь создать квиз с creatorId:", creatorId);

    if (!creatorId || creatorId === 'undefined') {
      alert('Ошибка: Авторизуйтесь, чтобы создать квиз');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions, creatorId: Number(creatorId) }) // Явно в число
      });
      
      if (response.ok) {
        alert('Викторина успешно создана!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert('Ошибка при сохранении: ' + (errorData.message || 'неизвестная ошибка'));
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert('Ошибка связи с сервером');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Шапка с кнопкой назад */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Новая викторина</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Отмена
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Название квиза */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Название теста</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Например: Основы JavaScript"
              required
            />
          </div>

          {/* Список вопросов */}
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative animate-in fade-in duration-300">
              {questions.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                >
                  Удалить
                </button>
              )}
              
              <h3 className="font-bold mb-4 text-blue-600">Вопрос №{qIndex + 1}</h3>
              
              <input 
                type="text"
                placeholder="Текст вопроса"
                className="w-full p-2 mb-6 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition-colors"
                value={q.questionText}
                onChange={(e) => {
                    const newQs = [...questions];
                    newQs[qIndex].questionText = e.target.value;
                    setQuestions(newQs);
                }}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-lg border ${q.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                    <input 
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctAnswer === oIndex}
                      onChange={() => {
                        const newQs = [...questions];
                        newQs[qIndex].correctAnswer = oIndex;
                        setQuestions(newQs);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <input 
                      type="text" 
                      placeholder={`Вариант ${oIndex + 1}`}
                      className="w-full bg-transparent border-none text-sm outline-none"
                      value={opt}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[qIndex].options[oIndex] = e.target.value;
                        setQuestions(newQs);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Кнопки действий */}
          <div className="flex flex-col md:flex-row gap-4 sticky bottom-8">
            <button 
              type="button" 
              onClick={addQuestion}
              className="flex-1 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all font-medium"
            >
              + Добавить вопрос
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl transition-transform active:scale-95"
            >
              Опубликовать в общую ленту
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;