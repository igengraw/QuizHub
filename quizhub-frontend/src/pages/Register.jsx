import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const userData = { username, email, password };
    console.log("Отправка данных:", userData);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(userData),
      });

      // Сначала получаем текст ответа, чтобы не было ошибки SyntaxError
      const text = await response.text();
      console.log("Ответ сервера (сырой):", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Сервер прислал не JSON, а: " + text.substring(0, 50));
      }

      if (response.ok) {
        alert('Регистрация успешна! Переходим на вход.');
        navigate('/login');
      } else {
        alert(data.message || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Детальная ошибка:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">Create account</h2>
        <p className="text-center text-gray-500 mb-4">Join to QuizHub today</p>
        
        <input 
          type="text" placeholder="Username" 
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={username} onChange={(e) => setUsername(e.target.value)} required
        />
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all shadow-lg">
          Sign in
        </button>
        
        <div className="text-center mt-6">
          <span className="text-gray-600">Already have account? </span>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;