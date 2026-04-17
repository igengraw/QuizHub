import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и имя
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user?.username || 'Пользователь');
        
        // Извлекаем ID (теперь бэкенд шлет userId напрямую)
        const id = data.userId || data.user?.id;
        
        if (id) {
          localStorage.setItem('userId', id);
          localStorage.setItem('user', JSON.stringify({ userId: id }));
          console.log("Успешный вход, ID сохранен:", id);
          navigate('/dashboard');
        } else {
          console.error("Сервер не прислал ID пользователя!", data);
          alert("Ошибка: не удалось получить ID пользователя");
        }
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">С возвращением!</h2>
        <input 
          type="email" placeholder="Email" required
          className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Пароль" required
          className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Войти
        </button>
        <p className="text-center text-sm text-gray-600">
          Нет аккаунта? <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:underline">Создать</button>
        </p>
      </form>
    </div>
  );
};

export default Login;