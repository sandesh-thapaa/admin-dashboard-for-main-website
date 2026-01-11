import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import InternPage from "./pages/User/UserPage";
import Training from "./pages/training/Training";
import MentorPage from "./pages/mentor/MentorPage";
import OpportunityPage from "./pages/opportunity/OpportunityPage";
import { OpportunityType } from "./types/opportunity";
import ServicePage from "./pages/service/ServicePage";
import ProjectPage from "./pages/project/ProjectPage";
import LogoutConfirm from "./pages/LogoutConfirm";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/interns/*"
            element={<InternPage type="interns" />}
          />
          <Route
            path="/dashboard/teams/*"
            element={<InternPage type="teams" />}
          />
          <Route path="/dashboard/mentors/*" element={<MentorPage />} />
          <Route path="/dashboard/trainings/*" element={<Training />} />
          <Route
            path="/dashboard/jobs/*"
            element={<OpportunityPage type={OpportunityType.JOB} />}
          />
          <Route
            path="/dashboard/internships/*"
            element={<OpportunityPage type={OpportunityType.INTERNSHIP} />}
          />
          <Route path="/dashboard/services/*" element={<ServicePage />} />
          <Route path="/dashboard/projects/*" element={<ProjectPage />} />
          <Route path="/logout/*" element={<LogoutConfirm />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
