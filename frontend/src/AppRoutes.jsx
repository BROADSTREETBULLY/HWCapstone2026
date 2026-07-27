import { Routes, Route } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import SpecLibrary from "./pages/SpecLibrary";
import AboutPage from "./pages/AboutPage";
import ScheduleShow from "./pages/ScheduleShow";
import LibrariesPage from "./pages/LibrariesPage";
import ProjectPage from "./pages/ProjectPage";



function AppRoutes() {
  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/library" element={<SpecLibrary />} />
      <Route path="/dashboard/schedules/:scheduleId" element={<ScheduleShow />} />
      <Route path="/dashboard/libraries" element={<LibrariesPage />} />
      <Route path="/dashboard/projects-page" element={<ProjectsPage />} />
      <Route path="/dashboard/projects/:projectId" element={<ProjectPage />} />
      <Route path="/dashboard/specs" element={<SpecLibrary />} />
      <Route path="*" element={<PageNotFound />} />
      
      
    </Routes>
  );
}

export default AppRoutes;