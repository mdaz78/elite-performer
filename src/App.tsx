import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components';
import { Dashboard } from './pages/Dashboard';
import { CodingPage } from './pages/CodingPage';
import { CourseDetail } from './pages/CourseDetail';
import { SWEPage } from './pages/SWEPage';
import { FitnessPage } from './pages/FitnessPage';
import { TradingPage } from './pages/TradingPage';
import { DailyTasksPage } from './pages/DailyTasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { WeeklyReviewPage } from './pages/WeeklyReviewPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/coding/:id" element={<CourseDetail />} />
            <Route path="/swe" element={<SWEPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/tasks" element={<DailyTasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/review" element={<WeeklyReviewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
