import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminInterviews.css";

const API_BASE_URL = "http://localhost:5000/api";

type Interview = {
  id: string;
  candidate_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  candidate_code: string;
  full_name: string;
  education: string | null;
  experience_years: string | null;
  candidate_level: string | null;
  round_count: number;
  completed_rounds: number;
};

type InterviewRound = {
  id: string;
  round_number: number;
  round_name: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
};

type InterviewSummary = {
  interview: Interview & {
    age: number | null;
    gender: string | null;
    email: string | null;
    phone: string | null;
    previous_company: string | null;
  };
  rounds: InterviewRound[];
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getLevelLabel = (level: string | null) => {
  if (level === "staff") return "Experienced Professional";
  if (level === "workmen") return "Early Career Opportunity";
  return "Not Specified";
};

const getStatusLabel = (status: string) => {
  const value = status.toLowerCase();

  if (value === "completed" || value === "complete") {
    return "Completed";
  }

  if (value === "in_progress" || value === "active") {
    return "In Progress";
  }

  if (value === "cancelled") {
    return "Cancelled";
  }

  return "Pending";
};

const getStatusClass = (status: string) => {
  const value = status.toLowerCase();

  if (value === "completed" || value === "complete") {
    return "completed";
  }

  if (value === "in_progress" || value === "active") {
    return "progress";
  }

  if (value === "cancelled") {
    return "cancelled";
  }

  return "pending";
};

export default function AdminInterviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showSummary, setShowSummary] = useState(false);

  const loadInterviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/interviews`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load interviews");
      }

      setInterviews(result.data || []);
    } catch (error) {
      console.error("Interview loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interviews.filter((interview) => {
      const matchesSearch =
        !query ||
        interview.full_name.toLowerCase().includes(query) ||
        interview.candidate_code.toLowerCase().includes(query) ||
        interview.education?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        interview.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, search, statusFilter]);

  const completedCount = interviews.filter((item) =>
    ["completed", "complete"].includes(item.status.toLowerCase())
  ).length;

  const progressCount = interviews.filter((item) =>
    ["in_progress", "active"].includes(item.status.toLowerCase())
  ).length;

  const pendingCount = interviews.filter((item) =>
    ["pending", "created"].includes(item.status.toLowerCase())
  ).length;

  const openInterview = async (interviewId: string) => {
    try {
      setSummaryLoading(true);
      setShowSummary(true);
      setSelectedInterview(null);

      const response = await fetch(
        `${API_BASE_URL}/interviews/${interviewId}/summary`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load interview");
      }

      setSelectedInterview(result.data);
    } catch (error) {
      console.error("Interview summary error:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="interview-page">
      {/* SIDEBAR */}
      <aside className="interview-sidebar">
        <div className="interview-brand">
          <div className="interview-brand-mark">RM</div>

          <div>
            <h2>Rajapalayam Mills</h2>
            <span>Recruitment Intelligence</span>
          </div>
        </div>

        <div className="interview-section-label">MAIN</div>

        <nav className="interview-nav">
          <button onClick={() => navigate("/admin")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/candidates")}>
            <span>♙</span>
            Candidates
          </button>

          <button className="active">
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

        <div className="interview-sidebar-bottom">
          <div className="interview-system">
            <span></span>

            <div>
              <strong>System Online</strong>
              <small>All services operational</small>
            </div>
          </div>

          <div className="interview-official">
            <div>HO</div>

            <section>
              <strong>High Official</strong>
              <small>Administrator</small>
            </section>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="interview-main">
        <header className="interview-topbar">
          <div>
            <span>Administration / Interviews</span>
            <h1>Interview Management</h1>
          </div>

          <div className="interview-topbar-right">
            <div className="interview-live">
              <i></i>
              LIVE
            </div>

            <div>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        <section className="interview-content">
          {/* HERO */}
          <div className="interview-hero">
            <div>
              <span className="interview-eyebrow">
                INTERVIEW OPERATIONS
              </span>

              <h2>
                Recruitment
                <strong> Pipeline</strong>
              </h2>

              <p>
                Monitor candidate interviews, round progression and
                recruitment status from one centralized control layer.
              </p>
            </div>

            <div className="interview-hero-count">
              <span>ACTIVE INTERVIEWS</span>
              <strong>{interviews.length}</strong>
              <small>Total interview records</small>
            </div>
          </div>

          {/* STATS */}
          <div className="interview-stats">
            <div className="interview-stat">
              <div className="interview-stat-icon">◈</div>

              <div>
                <span>Total Interviews</span>
                <strong>{interviews.length}</strong>
                <small>Interview records</small>
              </div>
            </div>

            <div className="interview-stat">
              <div className="interview-stat-icon pending">◷</div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
                <small>Awaiting progress</small>
              </div>
            </div>

            <div className="interview-stat">
              <div className="interview-stat-icon progress">↻</div>

              <div>
                <span>In Progress</span>
                <strong>{progressCount}</strong>
                <small>Currently active</small>
              </div>
            </div>

            <div className="interview-stat">
              <div className="interview-stat-icon completed">✓</div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
                <small>Finished interviews</small>
              </div>
            </div>
          </div>

          {/* PIPELINE */}
          <div className="pipeline-card">
            <div>
              <span className="interview-eyebrow">RECRUITMENT FLOW</span>
              <h3>Interview Lifecycle</h3>
            </div>

            <div className="pipeline">
              <div className="pipeline-step active">
                <span>01</span>
                <strong>Registration</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>02</span>
                <strong>Basic Round</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>03</span>
                <strong>Domain Round</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>04</span>
                <strong>AI Evaluation</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>05</span>
                <strong>HR Review</strong>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="interview-toolbar">
            <div className="interview-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidate, code or education..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button onClick={loadInterviews}>↻ Refresh</button>
          </div>

          {/* TABLE */}
          <section className="interview-table-card">
            <div className="interview-table-head">
              <div>
                <span className="interview-eyebrow">
                  INTERVIEW DATABASE
                </span>

                <h3>Interview Directory</h3>
              </div>

              <span>{filteredInterviews.length} records</span>
            </div>

            {loading ? (
              <div className="interview-empty">
                <div className="interview-spinner"></div>
                <p>Loading interview intelligence...</p>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="interview-empty">
                <div className="interview-empty-icon">◈</div>
                <h4>No interviews found</h4>
                <p>
                  Interview records will appear here once created.
                </p>
              </div>
            ) : (
              <div className="interview-table-wrapper">
                <table className="interview-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Profile</th>
                      <th>Rounds</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInterviews.map((interview) => (
                      <tr key={interview.id}>
                        <td>
                          <div className="interview-candidate">
                            <div>
                              {interview.full_name
                                .split(" ")
                                .slice(0, 2)
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </div>

                            <section>
                              <strong>{interview.full_name}</strong>
                              <span>
                                {interview.candidate_code}
                              </span>
                            </section>
                          </div>
                        </td>

                        <td>
                          <div className="interview-profile-cell">
                            <span
                              className={`interview-level ${
                                interview.candidate_level || "unknown"
                              }`}
                            >
                              {getLevelLabel(
                                interview.candidate_level
                              )}
                            </span>

                            <small>
                              {interview.education || "Education not provided"}
                            </small>
                          </div>
                        </td>

                        <td>
                          <div className="round-progress">
                            <div>
                              <strong>
                                {interview.completed_rounds}
                              </strong>
                              <span>
                                / {interview.round_count}
                              </span>
                            </div>

                            <small>completed</small>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`interview-status ${getStatusClass(
                              interview.status
                            )}`}
                          >
                            <i></i>
                            {getStatusLabel(interview.status)}
                          </span>
                        </td>

                        <td>
                          {formatDate(interview.created_at)}
                        </td>

                        <td>
                          <button
                            className="interview-view"
                            onClick={() =>
                              openInterview(interview.id)
                            }
                          >
                            Open Interview →
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

      {/* SUMMARY MODAL */}
      {showSummary && (
        <div
          className="interview-overlay"
          onClick={() => setShowSummary(false)}
        >
          <div
            className="interview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="interview-close"
              onClick={() => setShowSummary(false)}
            >
              ×
            </button>

            {summaryLoading ? (
              <div className="summary-loading">
                <div className="interview-spinner"></div>
                <p>Loading interview summary...</p>
              </div>
            ) : selectedInterview ? (
              <>
                <div className="summary-header">
                  <div className="summary-avatar">
                    {selectedInterview.interview.full_name
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <span className="interview-eyebrow">
                      INTERVIEW SUMMARY
                    </span>

                    <h2>
                      {selectedInterview.interview.full_name}
                    </h2>

                    <p>
                      {selectedInterview.interview.candidate_code}
                    </p>
                  </div>
                </div>

                <div className="summary-status-row">
                  <span
                    className={`interview-status ${getStatusClass(
                      selectedInterview.interview.status
                    )}`}
                  >
                    <i></i>
                    {getStatusLabel(
                      selectedInterview.interview.status
                    )}
                  </span>

                  <span>
                    Created{" "}
                    {formatDate(
                      selectedInterview.interview.created_at
                    )}
                  </span>
                </div>

                <div className="summary-details">
                  <div>
                    <span>Education</span>
                    <strong>
                      {selectedInterview.interview.education ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {selectedInterview.interview.experience_years
                        ? `${selectedInterview.interview.experience_years} years`
                        : "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Previous Company</span>
                    <strong>
                      {selectedInterview.interview
                        .previous_company || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedInterview.interview.email ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="round-section">
                  <div className="round-section-heading">
                    <div>
                      <span className="interview-eyebrow">
                        INTERVIEW PROGRESSION
                      </span>

                      <h3>Assessment Rounds</h3>
                    </div>

                    <span>
                      {selectedInterview.rounds.length} rounds
                    </span>
                  </div>

                  <div className="round-list">
                    {selectedInterview.rounds.map((round) => (
                      <div
                        className="round-card"
                        key={round.id}
                      >
                        <div className="round-number">
                          {String(round.round_number).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="round-info">
                          <strong>{round.round_name}</strong>

                          <span>
                            {round.started_at
                              ? `Started ${formatDate(
                                  round.started_at
                                )}`
                              : "Not started"}
                          </span>
                        </div>

                        <span
                          className={`interview-status ${getStatusClass(
                            round.status
                          )}`}
                        >
                          <i></i>
                          {getStatusLabel(round.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-footer">
                  <span>
                    Final recruitment decision remains with HR.
                  </span>

                  <button onClick={() => setShowSummary(false)}>
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}