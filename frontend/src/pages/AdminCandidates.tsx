import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCandidates.css";

const API_BASE_URL = "http://localhost:5000/api";

type Candidate = {
  id: string;
  candidate_code: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  education: string | null;
  experience_years: string | null;
  previous_company: string | null;
  candidate_level: string | null;
  created_at: string;
  updated_at: string;
  interview_count: number;
  candidate_photo_url: string | null;
};

type RoundOneAnswer = {
  id: string;
  question_id: string;
  answer_text: string | null;
  normalized_value: string | null;
  answer_mode: string;
  answered_at: string;
  question_text: string;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLevelLabel = (level: string | null) => {
  if (level === "staff") return "Experienced Professional";
  if (level === "workmen") return "Early Career Opportunity";
  return "Not Specified";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function AdminCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate | null>(null);

  const [roundOneAnswers, setRoundOneAnswers] = useState<RoundOneAnswer[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [answersLoading, setAnswersLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const [showProfile, setShowProfile] = useState(false);

  const loadCandidates = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/candidates`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load candidates");
      }

      setCandidates(result.data || []);
    } catch (error) {
      console.error("Candidate loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoundOneAnswers = async (candidateId: string) => {
    try {
      setAnswersLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/candidates/${candidateId}/round-one`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load answers");
      }

      setRoundOneAnswers(result.data || []);
    } catch (error) {
      console.error("Round 1 answer loading error:", error);
      setRoundOneAnswers([]);
    } finally {
      setAnswersLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.full_name.toLowerCase().includes(query) ||
        candidate.candidate_code.toLowerCase().includes(query) ||
        (candidate.email || "").toLowerCase().includes(query) ||
        (candidate.education || "").toLowerCase().includes(query);

      const matchesLevel =
        levelFilter === "all" ||
        candidate.candidate_level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [candidates, search, levelFilter]);

  const experiencedCount = candidates.filter(
    (candidate) => candidate.candidate_level === "staff"
  ).length;

  const earlyCareerCount = candidates.filter(
    (candidate) => candidate.candidate_level === "workmen"
  ).length;

  const interviewedCount = candidates.filter(
    (candidate) => candidate.interview_count > 0
  ).length;

  const openCandidateProfile = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
    setRoundOneAnswers([]);

    await loadRoundOneAnswers(candidate.id);
  };

  return (
    <div className="candidate-page">
      {/* Sidebar */}
      <aside className="candidate-sidebar">
        <div className="candidate-brand">
          <div className="brand-mark">RM</div>

          <div>
            <h2>Rajapalayam Mills</h2>
            <span>Recruitment Intelligence</span>
          </div>
        </div>

        <div className="sidebar-section-label">MAIN</div>

        <nav className="candidate-nav">
          <button onClick={() => navigate("/admin")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button className="active">
            <span>♙</span>
            Candidates
          </button>

          <button onClick={() => navigate("/admin/interviews")}>
            <span>◈</span>
            Interviews
          </button>

          <button onClick={() => navigate("/admin/questions")}>
            <span>▤</span>
            Question Bank
          </button>

          <button onClick={() => navigate("/admin/domains")}>
            <span>◇</span>
            Domains
          </button>

          <button onClick={() => navigate("/admin/reports")}>
            <span>▥</span>
            Reports
          </button>

          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>All services operational</small>
            </div>
          </div>

          <div className="official-card">
            <div className="official-avatar">HO</div>

            <div>
              <strong>High Official</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <div className="breadcrumb">
              Administration / Candidates
            </div>

            <h1>Candidate Management</h1>
          </div>

          <div className="topbar-right">
            <div className="live-indicator">
              <span></span>
              LIVE
            </div>

            <div className="topbar-date">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        <section className="candidate-content">
          {/* Hero */}
          <div className="candidate-hero">
            <div>
              <span className="eyebrow">TALENT OPERATIONS</span>

              <h2>
                Candidate
                <span> Intelligence</span>
              </h2>

              <p>
                Review candidate profiles, recruitment progress and
                Round 1 responses from one centralized workspace.
              </p>
            </div>

            <div className="hero-stat">
              <span>ACTIVE TALENT POOL</span>
              <strong>{candidates.length}</strong>
              <small>Registered candidates</small>
            </div>
          </div>

          {/* Stats */}
          <div className="candidate-stats">
            <div className="candidate-stat-card">
              <div className="stat-icon">♙</div>

              <div>
                <span>Total Candidates</span>
                <strong>{candidates.length}</strong>
                <small>Registered in system</small>
              </div>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon gold">★</div>

              <div>
                <span>Experienced</span>
                <strong>{experiencedCount}</strong>
                <small>Professional candidates</small>
              </div>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon blue">◎</div>

              <div>
                <span>Early Career</span>
                <strong>{earlyCareerCount}</strong>
                <small>Entry-level candidates</small>
              </div>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon green">✓</div>

              <div>
                <span>Interviewed</span>
                <strong>{interviewedCount}</strong>
                <small>Interview records created</small>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="candidate-toolbar">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidate, code, email or education..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="all">All Candidate Types</option>
              <option value="staff">Experienced Professional</option>
              <option value="workmen">Early Career Opportunity</option>
            </select>

            <button className="refresh-button" onClick={loadCandidates}>
              ↻ Refresh
            </button>
          </div>

          {/* Table */}
          <section className="candidate-table-card">
            <div className="table-header">
              <div>
                <span className="eyebrow">RECRUITMENT DATABASE</span>
                <h3>Candidate Directory</h3>
              </div>

              <span className="result-count">
                {filteredCandidates.length} records
              </span>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loading-ring"></div>
                <p>Loading candidate intelligence...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♙</div>
                <h4>No candidates found</h4>
                <p>
                  Try changing the search text or candidate filter.
                </p>
              </div>
            ) : (
              <div className="candidate-table-wrapper">
                <table className="candidate-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Profile</th>
                      <th>Education</th>
                      <th>Experience</th>
                      <th>Interview</th>
                      <th>Registered</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td>
                          <div className="candidate-identity">
                            <div className="candidate-avatar">
                              {getInitials(candidate.full_name)}
                            </div>

                            <div>
                              <strong>{candidate.full_name}</strong>

                              <span>
                                {candidate.candidate_code}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`level-badge ${
                              candidate.candidate_level || "unknown"
                            }`}
                          >
                            {getLevelLabel(candidate.candidate_level)}
                          </span>
                        </td>

                        <td>
                          <div className="education-cell">
                            <strong>
                              {candidate.education || "Not provided"}
                            </strong>

                            {candidate.previous_company && (
                              <span>
                                {candidate.previous_company}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          {candidate.experience_years
                            ? `${candidate.experience_years} yrs`
                            : "—"}
                        </td>

                        <td>
                          {candidate.interview_count > 0 ? (
                            <span className="interview-badge completed">
                              <span></span>
                              Interviewed
                            </span>
                          ) : (
                            <span className="interview-badge pending">
                              <span></span>
                              Pending
                            </span>
                          )}
                        </td>

                        <td>{formatDate(candidate.created_at)}</td>

                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              openCandidateProfile(candidate)
                            }
                          >
                            View Profile →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </main>

            {/* Candidate Profile Modal */}
      {showProfile && selectedCandidate && (
        <div
          className="profile-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="profile-close"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>

            {/* Candidate Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                {selectedCandidate.candidate_photo_url ? (
                  <img
                    src={`http://localhost:5000${selectedCandidate.candidate_photo_url}`}
                    alt={selectedCandidate.full_name}
                  />
                ) : (
                  getInitials(selectedCandidate.full_name)
                )}
              </div>

              <div>
                <span className="eyebrow">
                  CANDIDATE PROFILE
                </span>

                <h2>{selectedCandidate.full_name}</h2>

                <p>{selectedCandidate.candidate_code}</p>
              </div>
            </div>

            {/* Candidate Level */}
            <div className="profile-level">
              <span
                className={`level-badge ${
                  selectedCandidate.candidate_level || "unknown"
                }`}
              >
                {getLevelLabel(selectedCandidate.candidate_level)}
              </span>

              <span className="profile-created">
                Registered{" "}
                {formatDate(selectedCandidate.created_at)}
              </span>
            </div>

            {/* Candidate Details */}
            <div className="profile-grid">
              <div>
                <span>Education</span>
                <strong>
                  {selectedCandidate.education ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedCandidate.experience_years
                    ? `${selectedCandidate.experience_years} years`
                    : "Not provided"}
                </strong>
              </div>

              <div>
                <span>Previous Company</span>
                <strong>
                  {selectedCandidate.previous_company ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Age</span>
                <strong>
                  {selectedCandidate.age
                    ? `${selectedCandidate.age} years`
                    : "Not provided"}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {selectedCandidate.gender ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Blood Group</span>
                <strong>
                  {selectedCandidate.blood_group ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {selectedCandidate.phone ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedCandidate.email ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {selectedCandidate.address ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* Round 1 Responses */}
            <div className="profile-section">
              <div className="profile-section-title">
                <div>
                  <span className="eyebrow">
                    ROUND 1
                  </span>

                  <h3>Candidate Responses</h3>
                </div>

                <span>
                  {roundOneAnswers.length} answers
                </span>
              </div>

              {answersLoading ? (
                <div className="answers-loading">
                  Loading responses...
                </div>
              ) : roundOneAnswers.length === 0 ? (
                <div className="answers-empty">
                  No Round 1 responses available.
                </div>
              ) : (
                <div className="answers-list">
                  {roundOneAnswers.map(
                    (answer, index) => (
                      <div
                        className="answer-card"
                        key={answer.id}
                      >
                        <div className="answer-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="answer-content">
                          <h4>
                            {answer.question_text}
                          </h4>

                          <p>
                            {answer.answer_text ||
                              answer.normalized_value ||
                              "No answer recorded"}
                          </p>

                          <div className="answer-meta">
                            <span>
                              {answer.answer_mode ===
                              "voice"
                                ? "🎤 Voice Response"
                                : "⌨ Text Response"}
                            </span>

                            <span>
                              {formatDate(
                                answer.answered_at
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="profile-footer">
              <div>
                <span>
                  Recruitment Intelligence
                </span>

                <strong>
                  AI evaluation will support HR
                  decision-making.
                </strong>
              </div>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}