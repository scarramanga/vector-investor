import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import DiscoveryPage from './pages/DiscoveryPage';
// GAP-267 Phase 1: v2 flow runs alongside v1 until cutover.
import QuizPageV2 from './pages/QuizPageV2';
import ResultPageV2 from './pages/ResultPageV2';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/quiz-v2" element={<QuizPageV2 />} />
        <Route path="/result-v2" element={<ResultPageV2 />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
