// Every page URL in the app lives here.
// A :name in the path is a value read by the page, e.g. which schedule to load.

import { Routes, Route, Navigate } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import CategoryLibrary from "./pages/CategoryLibrary";
import AboutPage from "./pages/AboutPage";
import ScheduleShow from "./pages/ScheduleShow";
import LibrariesPage from "./pages/LibrariesPage";
import ProjectPage from "./pages/ProjectPage";



function AppRoutes() {
  return (
    <Routes>
      
      {/* home = the login page (it sends you to the dashboard if already logged in) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* plain /library isn't a page, so send people to the furniture one */}
      <Route path="/dashboard/library" element={<Navigate to="/dashboard/library/furniture" replace />} />
      <Route path="/dashboard/schedules/:scheduleId" element={<ScheduleShow />} />
      <Route path="/dashboard/libraries" element={<LibrariesPage />} />
      <Route path="/dashboard/projects-page" element={<ProjectsPage />} />
      <Route path="/dashboard/projects/:projectId" element={<ProjectPage />} />
      {/* one page reused for all three libraries - the bit after library/ says which */}
      <Route path="/dashboard/library/:categorySlug" element={<CategoryLibrary />} />
      {/* anything that doesn't match the routes above */}
      <Route path="*" element={<PageNotFound />} />
      
      
    </Routes>
  );
}

export default AppRoutes;