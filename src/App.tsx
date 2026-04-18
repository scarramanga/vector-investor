import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import DiscoveryPage from './pages/DiscoveryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
