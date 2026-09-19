import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ProjectLayout from './layouts/ProjectLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Spaces from './pages/Spaces';
import SpaceDetail from './pages/SpaceDetail';
import ProjectDashboard from './pages/ProjectDashboard';
import Materials from './pages/Materials';
import Knowledge from './pages/Knowledge';
import Tutor from './pages/Tutor';
import Quiz from './pages/Quiz';
import Mastery from './pages/Mastery';
import Growth from './pages/Growth';
import ProjectAnalytics from './pages/ProjectAnalytics';
import GlobalAnalytics from './pages/GlobalAnalytics';
import Settings from './pages/Settings';

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivity from './pages/admin/AdminActivity';
import AdminAIUsage from './pages/admin/AdminAIUsage';
import AdminAIEvaluations from './pages/admin/AdminAIEvaluations';
import AdminJobs from './pages/admin/AdminJobs';
import AdminHealth from './pages/admin/AdminHealth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/spaces/:spaceId" element={<SpaceDetail />} />
          <Route path="/analytics" element={<GlobalAnalytics />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProjectDashboard />} />
            <Route path="materials" element={<Materials />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="tutor" element={<Tutor />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="mastery" element={<Mastery />} />
            <Route path="growth" element={<Growth />} />
            <Route path="analytics" element={<ProjectAnalytics />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="ai-usage" element={<AdminAIUsage />} />
              <Route path="ai-evaluations" element={<AdminAIEvaluations />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="health" element={<AdminHealth />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
