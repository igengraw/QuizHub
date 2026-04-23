import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ViewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    // Используем роут редактирования, так как он отдает полную структуру квиза
    fetch(`http://localhost:5000/api/quizzes/edit/${id}`)
      .then(res => res.json())
      .then(data => setQuiz(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!quiz) return <div className="p-10 text-center">Загрузка содержания...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 font-medium hover:underline">
          ← Назад в панель
        </button>
        
        <div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
          <p className="text-gray-500 mt-2">Режим просмотра (Только чтение)</p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-700">
                {qIdx + 1}. {q.questionText}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <div 
                    key={oIdx} 
                    className={`p-3 rounded-xl border ${
                      oIdx === q.correctAnswer 
                        ? 'bg-green-50 border-green-500 ring-1 ring-green-500' 
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{opt}</span>
                    {oIdx === q.correctAnswer && (
                      <span className="ml-2 text-green-600 font-bold">✓ (Ответ)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewQuiz;