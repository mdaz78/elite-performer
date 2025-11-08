import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components';
import { CodingPage } from './pages/CodingPage';
import { CourseDetail } from './pages/CourseDetail';
import { Dashboard } from './pages/Dashboard';
import { FitnessPage } from './pages/FitnessPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { TradingPage } from './pages/TradingPage';

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
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/review" element={<TasksPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
