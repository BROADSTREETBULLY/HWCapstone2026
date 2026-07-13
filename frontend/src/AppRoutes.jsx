import { Routes, Route } from "react-router-dom";
import SpecList from "./pages/SpecList";
import SpecShow from "./pages/SpecShow";
import SpecCreate from "./components/SpecCreate";
import SpecEdit from "./pages/SpecEdit";
import PageNotFound from "./pages/PageNotFound";
import HomePage from "./pages/homePage";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import SpecLibrary from "./pages/SpecLibrary";
import AboutPage from "./pages/AboutPage";



function AppRoutes() {
  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/library" element={<SpecLibrary />} />
      <Route path="/dashboard/projects-page" element={<ProjectsPage />} />
      <Route path="/dashboard/specs" element={<SpecList />} />
      <Route path="/dashboard/specs/new" element={<SpecCreate />} />
      <Route path="/dashboard/specs/:SpecId" element={<SpecShow />} />
      <Route path="/dashboard/specs/:SpecId/edit" element={<SpecEdit />} />
      <Route path="*" element={<PageNotFound />} />
      
      
    </Routes>
  );
}

export default AppRoutes;