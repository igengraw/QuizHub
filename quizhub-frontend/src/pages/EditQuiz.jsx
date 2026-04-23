import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditQuiz = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/edit/${id}`);
        const data = await res.json();
        if (res.ok) {
          setTitle(data.title);
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions })
      });
      
      if (response.ok) {
        alert('Quiz has been edited successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Server connection error');
    }
  };

  if (loading) return <div className="p-8 text-center">Data loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Editing</h1>
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz label</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
              <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">Delete</button>
              <h3 className="font-bold mb-4 text-blue-600">Question №{qIndex + 1}</h3>
              <input 
                type="text"
                className="w-full p-2 mb-6 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition-colors"
                // Проверяем оба варианта названия ключа
                value={q.questionText || q.question_text || ""} 
                onChange={(e) => {
                    const newQs = [...questions];
                    // Обновляем оба ключа, чтобы и отображалось, и сохранялось
                    newQs[qIndex].questionText = e.target.value;
                    newQs[qIndex].question_text = e.target.value;
                    setQuestions(newQs);
                }}
                placeholder="Enter question text"
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
                    />
                    <input 
                      type="text" 
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

          <div className="flex gap-4 sticky bottom-8">
            <button type="button" onClick={addQuestion} className="flex-1 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
              + Add question
            </button>
            <button type="submit" className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-xl">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;