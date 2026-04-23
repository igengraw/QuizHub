import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import QuizPlayer from './pages/QuizPlayer';
import ViewQuiz from './pages/ViewQuiz';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/edit-quiz/:id" element={<EditQuiz />} />
        <Route path="/view-quiz/:id" element={<ViewQuiz />} />
        <Route path="/quiz/:id" element={<QuizPlayer />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;