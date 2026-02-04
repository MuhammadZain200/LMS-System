import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/login'
import Register from './pages/register'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect when we open URL */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
