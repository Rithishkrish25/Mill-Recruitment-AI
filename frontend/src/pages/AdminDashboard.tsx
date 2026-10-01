import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

type DashboardStats = {
  totalCandidates: number;
  totalInterviews: number;
  activeQuestions: number;
  activeDomains: number;
};

type Candidate = {
  id: string;
  candidate_code: string;
  full_name: string;
  education?: string;
  candidate_level?: string;
  created_at: string;
};

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalInterviews: 0,
    activeQuestions: 0,
    activeDomains: 0,
  });

  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, candidatesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`),
        fetch(`${API_BASE_URL}/candidates`),
      ]);

      const statsResult = await statsResponse.json();
      const candidatesResult = await candidatesResponse.json();

      if (!statsResponse.ok || !statsResult.success) {
        throw new Error(
          statsResult.message || "Failed to load dashboard statistics"
        );
      }

      setStats(statsResult.data);

      if (candidatesResult.success) {
        setRecentCandidates(
          (candidatesResult.data || []).slice(0, 6)
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load recruitment dashboard.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getCandidateType(level?: string) {
    if (level === "staff") return "Experienced Professional";
    if (level === "workmen") return "Early Career Opportunity";
    return "Candidate";
  }

  return (
    <div className="admin-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 75% 0%,
              rgba(196,154,72,0.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 5% 75%,
              rgba(49,67,78,0.14),
              transparent 30%
            ),
            #070a0c;
          color: #f2eee6;
          font-family: Inter, Arial, sans-serif;
          display: flex;
        }

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 270px;
          padding: 26px 18px;
          background:
            linear-gradient(
              180deg,
              rgba(15,19,22,0.99),
              rgba(7,10,12,0.99)
            );
          border-right: 1px solid rgba(255,255,255,0.07);
          z-index: 50;
        }

        .brand {
          padding: 5px 13px 25px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 25px;
        }

        .brand-mark {
          width: 48px;
          height: 48px;
          border: 1px solid rgba(196,154,72,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1aa5d;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -1px;
          background:
            linear-gradient(
              135deg,
              rgba(196,154,72,0.13),
              rgba(196,154,72,0.025)
            );
          box-shadow:
            0 0 30px rgba(196,154,72,0.05);
          margin-bottom: 14px;
        }

        .brand-name {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .brand-sub {
          margin-top: 5px;
          color: #697276;
          font-size: 8px;
          letter-spacing: 2px;
        }

        .nav-label {
          padding: 0 13px;
          margin: 0 0 10px;
          color: #596267;
          font-size: 8px;
          letter-spacing: 2.2px;
          text-transform: uppercase;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 13px;
          margin-bottom: 4px;
          border-radius: 7px;
          color: #899397;
          text-decoration: none;
          font-size: 11px;
          transition: all 0.22s ease;
        }

        .nav-link:hover {
          color: #f4efe6;
          background: rgba(255,255,255,0.04);
        }

        .nav-link.active {
          color: #e4c276;
          background:
            linear-gradient(
              90deg,
              rgba(196,154,72,0.16),
              rgba(196,154,72,0.025)
            );
        }

        .nav-link.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: #c49a48;
        }

        .nav-icon {
          width: 20px;
          text-align: center;
          color: #6f797d;
          font-size: 13px;
        }

        .nav-link.active .nav-icon {
          color: #c49a48;
        }

        .sidebar-bottom {
          position: absolute;
          left: 30px;
          right: 30px;
          bottom: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .official-label {
          color: #727c80;
          font-size: 8px;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }

        .system-status {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8aa695;
          font-size: 9px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7ca78c;
          box-shadow: 0 0 9px rgba(124,167,140,0.6);
        }

        /* =========================
           MAIN
        ========================= */

        .main {
          margin-left: 270px;
          width: calc(100% - 270px);
          min-height: 100vh;
          padding: 30px 40px 55px;
        }

        .topbar {
          min-height: 72px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .eyebrow {
          color: #c49a48;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .page-title {
          margin: 0;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -1px;
          font-weight: 750;
        }

        .page-description {
          margin-top: 8px;
          color: #707a7e;
          font-size: 11px;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 13px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          border-radius: 8px;
        }

        .admin-avatar {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #c49a48;
          color: #080a0b;
          font-size: 10px;
          font-weight: 900;
        }

        .admin-name {
          font-size: 10px;
          font-weight: 750;
        }

        .admin-role {
          margin-top: 3px;
          color: #6c767a;
          font-size: 8px;
        }

        /* =========================
           EXECUTIVE BANNER
        ========================= */

        .executive-banner {
          position: relative;
          overflow: hidden;
          margin-top: 25px;
          padding: 28px 30px;
          border: 1px solid rgba(196,154,72,0.17);
          border-radius: 12px;
          background:
            linear-gradient(
              105deg,
              rgba(196,154,72,0.09),
              rgba(255,255,255,0.018) 52%,
              rgba(255,255,255,0.008)
            );
        }

        .executive-banner::before {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          right: -150px;
          top: -175px;
          border: 1px solid rgba(196,154,72,0.09);
          border-radius: 50%;
        }

        .executive-banner::after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          right: -85px;
          top: -110px;
          border: 1px solid rgba(196,154,72,0.06);
          border-radius: 50%;
        }

        .banner-kicker {
          position: relative;
          z-index: 2;
          color: #c49a48;
          font-size: 8px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .banner-title {
          position: relative;
          z-index: 2;
          margin: 9px 0 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .banner-text {
          position: relative;
          z-index: 2;
          max-width: 650px;
          margin: 8px 0 0;
          color: #818b8f;
          font-size: 11px;
          line-height: 1.7;
        }

        /* =========================
           KPI
        ========================= */

        .section-label {
          margin-top: 26px;
          color: #646e72;
          font-size: 8px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin-top: 11px;
        }

        .kpi {
          position: relative;
          overflow: hidden;
          min-height: 137px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.034),
              rgba(255,255,255,0.012)
            );
          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .kpi:hover {
          transform: translateY(-3px);
          border-color: rgba(196,154,72,0.28);
        }

        .kpi::after {
          content: "";
          position: absolute;
          right: -25px;
          bottom: -45px;
          width: 120px;
          height: 120px;
          border: 1px solid rgba(196,154,72,0.06);
          border-radius: 50%;
        }

        .kpi-label {
          color: #727c80;
          font-size: 8px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .kpi-value {
          margin-top: 18px;
          font-size: 31px;
          line-height: 1;
          font-weight: 750;
          letter-spacing: -1px;
        }

        .kpi-value.gold {
          color: #d2ad62;
        }

        .kpi-foot {
          margin-top: 13px;
          color: #555f63;
          font-size: 8px;
        }

        /* =========================
           CONTENT
        ========================= */

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 16px;
          margin-top: 17px;
        }

        .panel {
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          background: rgba(255,255,255,0.018);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 21px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .panel-title {
          font-size: 12px;
          font-weight: 700;
        }

        .panel-subtitle {
          margin-top: 4px;
          color: #626c70;
          font-size: 8px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .panel-link {
          color: #c49a48;
          text-decoration: none;
          font-size: 8px;
          letter-spacing: 1px;
        }

        /* =========================
           PIPELINE
        ========================= */

        .pipeline {
          padding: 22px;
        }

        .pipeline-track {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .pipeline-step {
          position: relative;
          min-height: 105px;
          padding: 15px 13px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          background: rgba(255,255,255,0.018);
        }

        .pipeline-number {
          color: #c49a48;
          font-size: 9px;
          font-weight: 800;
        }

        .pipeline-step-title {
          margin-top: 13px;
          font-size: 10px;
          font-weight: 700;
        }

        .pipeline-step-text {
          margin-top: 5px;
          color: #626c70;
          font-size: 8px;
          line-height: 1.5;
        }

        .pipeline-line {
          position: absolute;
          top: 27px;
          right: -9px;
          width: 9px;
          height: 1px;
          background: rgba(196,154,72,0.25);
        }

        .pipeline-step:last-child .pipeline-line {
          display: none;
        }

        /* =========================
           CANDIDATES
        ========================= */

        .candidate-list {
          padding: 4px 0;
        }

        .candidate {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 21px;
          border-bottom: 1px solid rgba(255,255,255,0.045);
        }

        .candidate:last-child {
          border-bottom: none;
        }

        .candidate-avatar {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          border: 1px solid rgba(196,154,72,0.17);
          background: rgba(196,154,72,0.07);
          color: #c49a48;
          font-size: 9px;
          font-weight: 850;
        }

        .candidate-main {
          flex: 1;
          min-width: 0;
        }

        .candidate-name {
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .candidate-meta {
          margin-top: 4px;
          color: #606a6e;
          font-size: 8px;
        }

        .candidate-tag {
          padding: 5px 7px;
          border-radius: 5px;
          background: rgba(255,255,255,0.035);
          color: #899296;
          font-size: 7px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* =========================
           QUICK ACTIONS
        ========================= */

        .actions {
          display: grid;
          gap: 8px;
          padding: 17px;
        }

        .action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 14px;
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 7px;
          background: rgba(255,255,255,0.016);
          color: #a7b0b3;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .action:hover {
          color: #f2eee6;
          border-color: rgba(196,154,72,0.27);
          background: rgba(196,154,72,0.045);
        }

        .action-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-icon {
          color: #c49a48;
          font-size: 12px;
        }

        .action-arrow {
          color: #4d575b;
          font-size: 13px;
        }

        /* =========================
           SYSTEM OVERVIEW
        ========================= */

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        .overview-content {
          padding: 21px;
        }

        .overview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.045);
        }

        .overview-row:last-child {
          border-bottom: none;
        }

        .overview-name {
          color: #858f93;
          font-size: 9px;
        }

        .overview-value {
          color: #d9d4ca;
          font-size: 10px;
          font-weight: 700;
        }

        .overview-value.gold {
          color: #cda75b;
        }

        .ai-status {
          padding: 21px;
        }

        .ai-status-box {
          padding: 17px;
          border: 1px solid rgba(196,154,72,0.12);
          border-radius: 8px;
          background: rgba(196,154,72,0.035);
        }

        .ai-status-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d4af65;
          font-size: 10px;
          font-weight: 700;
        }

        .ai-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c49a48;
          box-shadow: 0 0 9px rgba(196,154,72,0.55);
        }

        .ai-status-text {
          margin-top: 9px;
          color: #707a7e;
          font-size: 9px;
          line-height: 1.7;
        }

        .ai-note {
          margin-top: 13px;
          color: #535d61;
          font-size: 8px;
          line-height: 1.6;
        }

        .empty {
          padding: 38px 20px;
          text-align: center;
          color: #5e686c;
          font-size: 10px;
        }

        .error {
          margin-top: 18px;
          padding: 12px 15px;
          border: 1px solid rgba(180,80,80,0.25);
          border-radius: 7px;
          color: #d78f8f;
          background: rgba(180,80,80,0.06);
          font-size: 10px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1250px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 78px;
            padding: 20px 10px;
          }

          .brand {
            padding: 4px 7px 20px;
          }

          .brand-name,
          .brand-sub,
          .nav-label,
          .nav-link span:not(.nav-icon),
          .sidebar-bottom {
            display: none;
          }

          .main {
            margin-left: 78px;
            width: calc(100% - 78px);
            padding: 25px;
          }

          .admin-profile {
            display: none;
          }

          .pipeline-track {
            grid-template-columns: repeat(2, 1fr);
          }

          .pipeline-line {
            display: none;
          }

          .lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .main {
            padding: 18px;
          }

          .page-title {
            font-size: 24px;
          }

          .page-description {
            max-width: 330px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .executive-banner {
            padding: 23px;
          }

          .pipeline-track {
            grid-template-columns: 1fr;
          }

          .candidate-tag {
            display: none;
          }
        }
      `}</style>

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RM</div>

          <div className="brand-name">
            RAJAPALAYAM MILLS
          </div>

          <div className="brand-sub">
            RECRUITMENT MANAGEMENT
          </div>
        </div>

        <div className="nav-label">
          Management
        </div>

        <Link className="nav-link active" to="/admin">
          <span className="nav-icon">⌂</span>
          <span>Dashboard</span>
        </Link>

        <Link className="nav-link" to="/admin/candidates">
          <span className="nav-icon">◉</span>
          <span>Candidates</span>
        </Link>

        <Link className="nav-link" to="/admin/interviews">
          <span className="nav-icon">◈</span>
          <span>Interviews</span>
        </Link>

        <Link className="nav-link" to="/admin/questions">
          <span className="nav-icon">▤</span>
          <span>Question Bank</span>
        </Link>

        <Link className="nav-link" to="/admin/domains">
          <span className="nav-icon">◇</span>
          <span>Domains</span>
        </Link>

        <Link className="nav-link" to="/admin/reports">
          <span className="nav-icon">▥</span>
          <span>Reports</span>
        </Link>

        <div
          className="nav-label"
          style={{ marginTop: "28px" }}
        >
          System
        </div>

        <Link className="nav-link" to="/admin/settings">
          <span className="nav-icon">⚙</span>
          <span>Settings</span>
        </Link>

        <div className="sidebar-bottom">
          <div className="official-label">
            High Official Portal
          </div>

          <div className="system-status">
            <span className="status-dot" />
            System Online
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              Recruitment Intelligence
            </div>

            <h1 className="page-title">
              Executive Dashboard
            </h1>

            <div className="page-description">
              Central command for recruitment operations,
              interviews and AI-assisted assessment.
            </div>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              AD
            </div>

            <div>
              <div className="admin-name">
                High Official
              </div>

              <div className="admin-role">
                Recruitment Administrator
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <section className="executive-banner">
          <div className="banner-kicker">
            Rajapalayam Mills Limited
          </div>

          <h2 className="banner-title">
            Recruitment Operations Overview
          </h2>

          <p className="banner-text">
            Monitor candidate registrations, interview activity,
            question-bank readiness and domain coverage from one
            centralized recruitment intelligence platform.
          </p>
        </section>

        {/* KPI */}

        <div className="section-label">
          Executive Metrics
        </div>

        <section className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">
              Total Candidates
            </div>

            <div className="kpi-value">
              {loading ? "—" : stats.totalCandidates}
            </div>

            <div className="kpi-foot">
              Registered candidates
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-label">
              Total Interviews
            </div>

            <div className="kpi-value">
              {loading ? "—" : stats.totalInterviews}
            </div>

            <div className="kpi-foot">
              Interview records
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-label">
              Active Questions
            </div>

            <div className="kpi-value gold">
              {loading ? "—" : stats.activeQuestions}
            </div>

            <div className="kpi-foot">
              Available question bank
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-label">
              Active Domains
            </div>

            <div className="kpi-value gold">
              {loading ? "—" : stats.activeDomains}
            </div>

            <div className="kpi-foot">
              Interview domains
            </div>
          </div>
        </section>

        {/* PIPELINE */}

        <div className="section-label">
          Recruitment Workflow
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Interview Pipeline
              </div>

              <div className="panel-subtitle">
                End-to-end recruitment flow
              </div>
            </div>
          </div>

          <div className="pipeline">
            <div className="pipeline-track">
              <div className="pipeline-step">
                <div className="pipeline-number">
                  01
                </div>

                <div className="pipeline-step-title">
                  Registration
                </div>

                <div className="pipeline-step-text">
                  Candidate profile creation
                </div>

                <div className="pipeline-line" />
              </div>

              <div className="pipeline-step">
                <div className="pipeline-number">
                  02
                </div>

                <div className="pipeline-step-title">
                  Basic Round
                </div>

                <div className="pipeline-step-text">
                  AI-guided basic information
                </div>

                <div className="pipeline-line" />
              </div>

              <div className="pipeline-step">
                <div className="pipeline-number">
                  03
                </div>

                <div className="pipeline-step-title">
                  Domain Round
                </div>

                <div className="pipeline-step-text">
                  Role-specific technical questions
                </div>

                <div className="pipeline-line" />
              </div>

              <div className="pipeline-step">
                <div className="pipeline-number">
                  04
                </div>

                <div className="pipeline-step-title">
                  AI Evaluation
                </div>

                <div className="pipeline-step-text">
                  Concept-based answer assessment
                </div>

                <div className="pipeline-line" />
              </div>

              <div className="pipeline-step">
                <div className="pipeline-number">
                  05
                </div>

                <div className="pipeline-step-title">
                  HR Review
                </div>

                <div className="pipeline-step-text">
                  Final human decision
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CANDIDATES + ACTIONS */}

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Recent Candidates
                </div>

                <div className="panel-subtitle">
                  Latest registrations
                </div>
              </div>

              <Link
                className="panel-link"
                to="/admin/candidates"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="candidate-list">
              {recentCandidates.length === 0 ? (
                <div className="empty">
                  No candidates registered yet.
                </div>
              ) : (
                recentCandidates.map((candidate) => (
                  <div
                    className="candidate"
                    key={candidate.id}
                  >
                    <div className="candidate-avatar">
                      {candidate.full_name
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="candidate-main">
                      <div className="candidate-name">
                        {candidate.full_name}
                      </div>

                      <div className="candidate-meta">
                        {candidate.candidate_code}
                        {" • "}
                        {formatDate(candidate.created_at)}
                      </div>
                    </div>

                    <div className="candidate-tag">
                      {getCandidateType(
                        candidate.candidate_level
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Quick Actions
                </div>

                <div className="panel-subtitle">
                  Management controls
                </div>
              </div>
            </div>

            <div className="actions">
              <Link
                className="action"
                to="/admin/questions"
              >
                <div className="action-left">
                  <span className="action-icon">
                    ▤
                  </span>

                  <span>
                    Question Bank
                  </span>
                </div>

                <span className="action-arrow">
                  →
                </span>
              </Link>

              <Link
                className="action"
                to="/admin/questions"
              >
                <div className="action-left">
                  <span className="action-icon">
                    ◇
                  </span>

                  <span>
                    Domain Management
                  </span>
                </div>

                <span className="action-arrow">
                  →
                </span>
              </Link>

              <Link
                className="action"
                to="/admin/candidates"
              >
                <div className="action-left">
                  <span className="action-icon">
                    ◉
                  </span>

                  <span>
                    Candidate Management
                  </span>
                </div>

                <span className="action-arrow">
                  →
                </span>
              </Link>

              <Link
                className="action"
                to="/admin/reports"
              >
                <div className="action-left">
                  <span className="action-icon">
                    ▥
                  </span>

                  <span>
                    Interview Reports
                  </span>
                </div>

                <span className="action-arrow">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* LOWER INFORMATION */}

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Recruitment System
                </div>

                <div className="panel-subtitle">
                  Current platform configuration
                </div>
              </div>
            </div>

            <div className="overview-content">
              <div className="overview-row">
                <span className="overview-name">
                  Candidate Intake
                </span>

                <span className="overview-value gold">
                  Active
                </span>
              </div>

              <div className="overview-row">
                <span className="overview-name">
                  Basic Interview
                </span>

                <span className="overview-value gold">
                  Configured
                </span>
              </div>

              <div className="overview-row">
                <span className="overview-name">
                  Domain Interview
                </span>

                <span className="overview-value gold">
                  Configured
                </span>
              </div>

              <div className="overview-row">
                <span className="overview-name">
                  Question Bank
                </span>

                <span className="overview-value">
                  {loading
                    ? "—"
                    : `${stats.activeQuestions} active`}
                </span>
              </div>

              <div className="overview-row">
                <span className="overview-name">
                  Interview Domains
                </span>

                <span className="overview-value">
                  {loading
                    ? "—"
                    : `${stats.activeDomains} active`}
                </span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  AI Evaluation Layer
                </div>

                <div className="panel-subtitle">
                  Recruitment intelligence
                </div>
              </div>
            </div>

            <div className="ai-status">
              <div className="ai-status-box">
                <div className="ai-status-title">
                  <span className="ai-status-dot" />
                  AI-assisted evaluation architecture
                </div>

                <div className="ai-status-text">
                  Candidate answers can be evaluated against
                  company-defined reference concepts and
                  evaluation criteria.
                </div>

                <div className="ai-note">
                  AI provides assessment support. Final
                  recruitment decisions remain with authorized
                  HR personnel.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;