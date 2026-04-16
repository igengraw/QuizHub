import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // Добавление нового пустого вопроса
  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  // Удаление вопроса
  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, questions });
    alert('Квиз сохранен локально (в консоли)!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Создание нового квиза</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Название квиза */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Название теста</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Например: Основы JavaScript"
              required
            />
          </div>

          {/* Список вопросов */}
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
              <button 
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              >
                Удалить
              </button>
              
              <h3 className="font-bold mb-4 text-blue-600">Вопрос №{qIndex + 1}</h3>
              
              <input 
                type="text"
                placeholder="Текст вопроса"
                className="w-full p-2 mb-4 border-b border-gray-200 focus:border-blue-500 outline-none"
                value={q.questionText}
                onChange={(e) => {
                    const newQs = [...questions];
                    newQs[qIndex].questionText = e.target.value;
                    setQuestions(newQs);
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctAnswer === oIndex}
                      onChange={() => {
                        const newQs = [...questions];
                        newQs[qIndex].correctAnswer = oIndex;
                        setQuestions(newQs);
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder={`Вариант ${oIndex + 1}`}
                      className="w-full p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                      value={opt}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[qIndex].options[oIndex] = e.target.value;
                        setQuestions(newQs);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={addQuestion}
              className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-100 transition"
            >
              + Добавить вопрос
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg"
            >
              Опубликовать квиз
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;