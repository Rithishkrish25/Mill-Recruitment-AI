const API_BASE_URL = "http://localhost:5000/api";

/* =========================================================
   ROUND 1 QUESTIONS
========================================================= */

export async function getRoundOneQuestions() {
  const response = await fetch(
    `${API_BASE_URL}/round-one/questions`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Round 1 questions");
  }

  return response.json();
}

/* =========================================================
   ROUND 1 ANSWERS - SAVE / UPDATE
========================================================= */

export async function saveRoundOneAnswer(data: {
  candidateId: string;
  interviewId: string;
  roundId: string;
  questionId: string;
  answerText: string;
  normalizedValue?: string;
  answerMode?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/round-one/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to save Round 1 answer"
    );
  }

  return result;
}

/* =========================================================
   ROUND 1 ANSWERS - GET EXISTING ANSWERS
========================================================= */

export async function getRoundOneAnswers(roundId: string) {
  const response = await fetch(
    `${API_BASE_URL}/round-one/answers/${roundId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Round 1 answers");
  }

  return response.json();
}

/* =========================================================
   ROUND 1 - CONFIRM DETAILS
========================================================= */

export async function confirmRoundOne(data: {
  candidateId: string;
  interviewId: string;
  roundId: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/round-one/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to confirm Round 1"
    );
  }

  return result;
}

/* =========================================================
   CANDIDATE - CREATE NEW
========================================================= */

export async function createCandidate(data: {
  candidateCode: string;
  fullName: string;
  candidateLevel?: "staff" | "workmen" | null;
}) {
  const response = await fetch(
    `${API_BASE_URL}/candidates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create candidate"
    );
  }

  return result;
}

/* =========================================================
   CANDIDATE - UPDATE
========================================================= */

export async function updateCandidate(
  candidateId: string,
  data: {
    fullName?: string;
    age?: number | null;
    gender?: string | null;
    bloodGroup?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    education?: string | null;
    experienceYears?: number | null;
    previousCompany?: string | null;
    candidateLevel?: "staff" | "workmen" | null;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/candidates/${candidateId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update candidate"
    );
  }

  return result;
}

/* =========================================================
   INTERVIEW - CREATE NEW
========================================================= */

export async function createInterview(data: {
  candidate_id: string;
  job_role_id?: string | null;
  domain_id?: string | null;
}) {
  const response = await fetch(
    `${API_BASE_URL}/interviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create interview"
    );
  }

  return result;
}

/* =========================================================
   INTERVIEW - GET ROUNDS
========================================================= */

export async function getInterviewRounds(
  interviewId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/interviews/${interviewId}/rounds`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch interview rounds"
    );
  }

  return response.json();
}

/* =========================================================
   CANDIDATE - PHOTO UPLOAD
========================================================= */

export async function uploadCandidatePhoto(
  candidateId: string,
  photo: File
) {
  const formData = new FormData();

  formData.append("photo", photo);

  const response = await fetch(
    `${API_BASE_URL}/candidates/${candidateId}/photo`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to upload candidate photo"
    );
  }

  return result;
}