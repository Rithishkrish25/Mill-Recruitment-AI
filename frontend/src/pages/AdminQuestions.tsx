import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

type QuestionType = "BASIC" | "DOMAIN";

type Question = {
  id: string;
  domain_id: string | null;
  question_text: string;
  reference_answer: string | null;
  max_marks: number;
  difficulty: string | null;
  question_type: QuestionType;
  is_active: boolean;
  created_at: string;
};

type Domain = {
  id: string;
  name: string;
  is_active: boolean;
};

function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(
    null
  );

  const [questionType, setQuestionType] = useState<QuestionType>("BASIC");
  const [domainId, setDomainId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [referenceAnswer, setReferenceAnswer] = useState("");
  const [maxMarks, setMaxMarks] = useState("5");
  const [difficulty, setDifficulty] = useState("Basic");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | QuestionType>("ALL");
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [domainName, setDomainName] = useState("");
  const [domainDescription, setDomainDescription] = useState("");
  const [domainSaving, setDomainSaving] = useState(false);

  function openAddDomainForm() {
  setEditingDomain(null);
  setDomainName("");
  setDomainDescription("");
  setShowDomainForm(true);
}

function openEditDomainForm(domain: Domain) {
  setEditingDomain(domain);
  setDomainName(domain.name);
  setDomainDescription("");
  setShowDomainForm(true);
}

async function handleDomainSubmit(event: React.FormEvent) {
  event.preventDefault();

  if (!domainName.trim()) {
    alert("Please enter the domain name.");
    return;
  }

  try {
    setDomainSaving(true);

    const url = editingDomain
      ? `${API_BASE_URL}/domains/${editingDomain.id}`
      : `${API_BASE_URL}/domains`;

    const response = await fetch(url, {
      method: editingDomain ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: domainName.trim(),
        description: domainDescription.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Unable to save domain.");
      return;
    }

    alert(
      editingDomain
        ? "Domain updated successfully."
        : "Domain added successfully."
    );

    setShowDomainForm(false);
    setEditingDomain(null);
    setDomainName("");
    setDomainDescription("");

    await loadDomains();
  } catch (error) {
    console.error("Domain save error:", error);
    alert("Unable to save domain.");
  } finally {
    setDomainSaving(false);
  }
}

async function toggleDomainStatus(domain: Domain) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/domains/${domain.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !domain.is_active,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to update domain status.");
      return;
    }

    await loadDomains();
  } catch (error) {
    console.error("Domain status error:", error);
    alert("Unable to update domain status.");
  }
}
  async function loadQuestions() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/questions?questionType=${
          filterType === "ALL" ? "" : filterType
        }`
      );

      const result = await response.json();

      if (result.success) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDomains() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/domains`
    );

    const result = await response.json();

    if (result.success) {
      setDomains(result.data);
    }
  } catch (error) {
    console.error(
      "Failed to load domains:",
      error
    );
  }
}

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [filterType]);

  function resetForm() {
    setQuestionType("BASIC");
    setDomainId("");
    setQuestionText("");
    setReferenceAnswer("");
    setMaxMarks("5");
    setDifficulty("Basic");
    setEditingQuestion(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(question: Question) {
    setEditingQuestion(question);

    setQuestionType(question.question_type);
    setDomainId(question.domain_id || "");
    setQuestionText(question.question_text);
    setReferenceAnswer(question.reference_answer || "");
    setMaxMarks(String(question.max_marks));
    setDifficulty(question.difficulty || "Basic");

    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!questionText.trim()) {
      alert("Please enter the question.");
      return;
    }

    if (questionType === "DOMAIN" && !domainId) {
      alert("Please select a domain.");
      return;
    }

    const payload = {
      domainId: questionType === "DOMAIN" ? domainId : null,
      questionText: questionText.trim(),
      referenceAnswer: referenceAnswer.trim(),
      maxMarks: Number(maxMarks),
      difficulty,
      questionType,
    };

    try {
      const url = editingQuestion
        ? `${API_BASE_URL}/questions/${editingQuestion.id}`
        : `${API_BASE_URL}/questions`;

      const response = await fetch(url, {
        method: editingQuestion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Something went wrong.");
        return;
      }

      alert(
        editingQuestion
          ? "Question updated successfully."
          : "Question added successfully."
      );

      setShowForm(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      console.error("Question save error:", error);
      alert("Unable to save question.");
    }
  }

  async function toggleStatus(question: Question) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/questions/${question.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !question.is_active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to update status.");
        return;
      }

      loadQuestions();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to update question status.");
    }
  }

  const filteredQuestions = questions.filter((question) =>
    question.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #071014;
          color: #f5f0e7;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        .admin-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 10%, rgba(184, 134, 11, 0.08), transparent 28%),
            radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.04), transparent 30%),
            #071014;
        }

        .admin-topbar {
          height: 82px;
          padding: 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(5, 10, 12, 0.92);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          border: 1px solid #c49a48;
          display: grid;
          place-items: center;
          color: #d4ad61;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .brand-text strong {
          display: block;
          font-size: 14px;
          letter-spacing: 2px;
        }

        .brand-text span {
          display: block;
          margin-top: 4px;
          font-size: 10px;
          color: #8f999b;
          letter-spacing: 2px;
        }

        .admin-label {
          padding: 9px 14px;
          border: 1px solid rgba(196,154,72,0.35);
          color: #d4ad61;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .admin-main {
          padding: 44px;
          max-width: 1500px;
          margin: auto;
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 34px;
        }

        .eyebrow {
          color: #c49a48;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .page-heading h1 {
          margin: 10px 0 10px;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 0.95;
          letter-spacing: -2px;
        }

        .page-heading p {
          margin: 0;
          max-width: 650px;
          color: #8f999b;
          line-height: 1.7;
          font-size: 14px;
        }

        .add-button {
          border: 0;
          background: #c49a48;
          color: #101417;
          padding: 15px 22px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .add-button:hover {
          background: #e0bd76;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 22px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .stat-card span {
          display: block;
          color: #8f999b;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .stat-card strong {
          display: block;
          margin-top: 8px;
          font-size: 30px;
          color: #d4ad61;
        }

        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-box {
          flex: 1;
          background: #0b171b;
          border: 1px solid rgba(255,255,255,0.09);
          color: white;
          padding: 14px 16px;
          outline: none;
        }

        .filter-select {
          min-width: 170px;
          background: #0b171b;
          border: 1px solid rgba(255,255,255,0.09);
          color: white;
          padding: 14px;
          outline: none;
        }

        .question-table {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        th {
          text-align: left;
          padding: 16px;
          font-size: 10px;
          color: #8f999b;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        td {
          padding: 17px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          vertical-align: top;
          font-size: 13px;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        .question-text {
          max-width: 480px;
          line-height: 1.55;
        }

        .badge {
          display: inline-flex;
          padding: 6px 9px;
          font-size: 10px;
          letter-spacing: 1px;
          font-weight: 800;
        }

        .badge-basic {
          background: rgba(196,154,72,0.14);
          color: #d4ad61;
        }

        .badge-domain {
          background: rgba(91,151,160,0.14);
          color: #8ed0d8;
        }

        .status-active {
          color: #8dd5a7;
        }

        .status-inactive {
          color: #e28d8d;
        }

        .action-row {
          display: flex;
          gap: 8px;
        }

        .action-button {
          padding: 8px 11px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #d9dfdf;
          cursor: pointer;
          font-size: 11px;
        }

        .action-button:hover {
          border-color: #c49a48;
          color: #d4ad61;
        }

        .empty-state {
          padding: 60px;
          text-align: center;
          color: #8f999b;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 100;
        }

        .modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #0a1519;
          border: 1px solid rgba(196,154,72,0.28);
          box-shadow: 0 30px 100px rgba(0,0,0,0.55);
        }

        .modal-header {
          padding: 24px 26px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 23px;
        }

        .close-button {
          background: transparent;
          border: 0;
          color: #8f999b;
          font-size: 24px;
          cursor: pointer;
        }

        .form {
          padding: 26px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          color: #9ba5a7;
          font-size: 11px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          background: #071014;
          color: #f5f0e7;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 13px;
          outline: none;
        }

        .field textarea {
          min-height: 110px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: rgba(196,154,72,0.7);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .cancel-button {
          padding: 13px 18px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #b9c0c1;
          cursor: pointer;
        }

        .save-button {
          padding: 13px 20px;
          background: #c49a48;
          border: 0;
          color: #101417;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .admin-topbar {
            padding: 0 18px;
          }

          .admin-main {
            padding: 28px 18px;
          }

          .page-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .toolbar {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <header className="admin-topbar">
        <div className="brand">
          <div className="brand-mark">RM</div>

          <div className="brand-text">
            <strong>RAJAPALAYAM MILLS</strong>
            <span>RECRUITMENT MANAGEMENT</span>
          </div>
        </div>

        <div className="admin-label">High Official / Admin</div>
      </header>

      <main className="admin-main">
        <section className="page-heading">
          <div>
            <div className="eyebrow">Question Management</div>

            <h1>
              Interview
              <br />
              Question Bank.
            </h1>

            <p>
              Manage the questions used across the recruitment
              interview rounds. Create, edit and control active
              questions without changing the application code.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="add-button"
              onClick={openAddDomainForm}
            >
             + Manage Domains
            </button>

            <button
              className="add-button"
             onClick={openAddForm}
            >
             + Add Question
            </button>
         </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Questions</span>
            <strong>{questions.length}</strong>
          </div>

          <div className="stat-card">
            <span>Basic Questions</span>
            <strong>
              {questions.filter((q) => q.question_type === "BASIC").length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Domain Questions</span>
            <strong>
              {questions.filter((q) => q.question_type === "DOMAIN").length}
            </strong>
          </div>
        </section>

        <section className="toolbar">
          <input
            className="search-box"
            placeholder="Search questions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="filter-select"
            value={filterType}
            onChange={(event) =>
              setFilterType(event.target.value as "ALL" | QuestionType)
            }
          >
            <option value="ALL">All Questions</option>
            <option value="BASIC">Basic Questions</option>
            <option value="DOMAIN">Domain Questions</option>
          </select>
        </section>

        <section className="question-table">
          {loading ? (
            <div className="empty-state">Loading question bank...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state">
              No questions found.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Domain</th>
                  <th>Marks</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.map((question) => {
                  const domain = domains.find(
                    (item) => item.id === question.domain_id
                  );

                  return (
                    <tr key={question.id}>
                      <td>
                        <div className="question-text">
                          {question.question_text}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            question.question_type === "BASIC"
                              ? "badge-basic"
                              : "badge-domain"
                          }`}
                        >
                          {question.question_type}
                        </span>
                      </td>

                      <td>{domain?.name || "—"}</td>

                      <td>{question.max_marks}</td>

                      <td>{question.difficulty || "—"}</td>

                      <td>
                        <span
                          className={
                            question.is_active
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {question.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="action-row">
                          <button
                            className="action-button"
                            onClick={() => openEditForm(question)}
                          >
                            Edit
                          </button>

                          <button
                            className="action-button"
                            onClick={() => toggleStatus(question)}
                          >
                            {question.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {showDomainForm && (
  <div
    className="modal-backdrop"
    onMouseDown={() => setShowDomainForm(false)}
  >
    <div
      className="modal"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>Domain Management</h2>
          <p
            style={{
              margin: "6px 0 0",
              color: "#8f999b",
              fontSize: "12px",
            }}
          >
            Manage interview domains used for Round 2.
          </p>
        </div>

        <button
          className="close-button"
          onClick={() => setShowDomainForm(false)}
        >
          ×
        </button>
      </div>

      <div className="form">
        <form onSubmit={handleDomainSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Domain Name</label>

              <input
                value={domainName}
                onChange={(event) =>
                  setDomainName(event.target.value)
                }
                placeholder="Example: Electrical"
              />
            </div>

            <div className="field full">
              <label>Description</label>

              <textarea
                value={domainDescription}
                onChange={(event) =>
                  setDomainDescription(event.target.value)
                }
                placeholder="Enter a short description for this domain..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowDomainForm(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={domainSaving}
            >
              {domainSaving
                ? "Saving..."
                : editingDomain
                ? "Update Domain"
                : "Add Domain"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "28px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "22px",
          }}
        >
          <div
            style={{
              color: "#c49a48",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Existing Domains
          </div>

          {domains.length === 0 ? (
            <div className="empty-state">
              No domains available.
            </div>
          ) : (
            <div>
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "15px 0",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                      }}
                    >
                      {domain.name}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "5px",
                        fontSize: "11px",
                        color: domain.is_active
                          ? "#8dd5a7"
                          : "#e28d8d",
                      }}
                    >
                      {domain.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="action-row">
                    <button
                      type="button"
                      className="action-button"
                      onClick={() =>
                        openEditDomainForm(domain)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="action-button"
                      onClick={() =>
                        toggleDomainStatus(domain)
                      }
                    >
                      {domain.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

    
      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowForm(false)}
        >
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingQuestion ? "Edit Question" : "Add Question"}
              </h2>

              <button
                className="close-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Question Type</label>

                  <select
                    value={questionType}
                    onChange={(event) =>
                      setQuestionType(
                        event.target.value as QuestionType
                      )
                    }
                  >
                    <option value="BASIC">Basic — Round 1</option>
                    <option value="DOMAIN">Domain — Round 2</option>
                  </select>
                </div>

                <div className="field">
                  <label>Difficulty</label>

                  <select
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(event.target.value)
                    }
                  >
                    <option>Basic</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                {questionType === "DOMAIN" && (
                  <div className="field full">
                    <label>Domain</label>

                    <select
                      value={domainId}
                      onChange={(event) =>
                        setDomainId(event.target.value)
                      }
                    >
                      <option value="">Select domain</option>

                      {domains
                        .filter((domain) => domain.is_active)
                        .map((domain) => (
                          <option key={domain.id} value={domain.id}>
                            {domain.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="field full">
                  <label>Question</label>

                  <textarea
                    value={questionText}
                    onChange={(event) =>
                      setQuestionText(event.target.value)
                    }
                    placeholder="Enter the interview question..."
                  />
                </div>

                <div className="field full">
                  <label>Reference Answer / Evaluation Guide</label>

                  <textarea
                    value={referenceAnswer}
                    onChange={(event) =>
                      setReferenceAnswer(event.target.value)
                    }
                    placeholder="Enter the expected answer or concepts..."
                  />
                </div>

                <div className="field">
                  <label>Maximum Marks</label>

                  <input
                    type="number"
                    min="1"
                    value={maxMarks}
                    onChange={(event) =>
                      setMaxMarks(event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  {editingQuestion
                    ? "Update Question"
                    : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuestions;