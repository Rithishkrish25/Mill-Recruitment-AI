import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCandidates from "./pages/AdminCandidates";
import AdminInterviews from "./pages/AdminInterviews";

import Home from "./pages/Home";
import RoundOne from "./pages/RoundOne";
import AdminQuestions from "./pages/AdminQuestions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Candidate */}
        <Route path="/" element={<Home />} />
        <Route path="/round-one" element={<RoundOne />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/candidates" element={<AdminCandidates />} />
        <Route path="/admin/interviews" element={<AdminInterviews />} />

        {/* Admin */}
        <Route
          path="/admin/questions"
          element={<AdminQuestions />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;