import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DiscoveryPage from './pages/DiscoveryPage';
// GAP-270: the v1 quiz/result flow (AI-prose PDF) is retired; v2 is the only
// quiz flow. The landing page routes to /quiz-v2.
import QuizPageV2 from './pages/QuizPageV2';
import ResultPageV2 from './pages/ResultPageV2';
// Stack AI page (Ripen spec, Build 2): the conversational front door, by token.
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz-v2" element={<QuizPageV2 />} />
        <Route path="/result-v2" element={<ResultPageV2 />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
