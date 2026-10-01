import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent } from "react";

import {
  getRoundOneQuestions,
  saveRoundOneAnswer,
  updateCandidate,
  confirmRoundOne,
  createCandidate,
  createInterview,
  getInterviewRounds,
  uploadCandidatePhoto,
} from "../services/api";

/* =========================================================
   TYPES
========================================================= */

type RoundOneQuestion = {
  id: string;
  field_key: string;
  question_text: string;
  question_text_tamil: string;
  input_type: string;
  is_required: boolean;
  display_order: number;
};

type CandidateDetails = {
  id?: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  education: string | null;
  experience_years: number | null;
  previous_company: string | null;
  candidate_level: "staff" | "workmen" | null;
  photo_url?: string | null;
};

type ConversationMessage = {
  id: string;
  role: "ai" | "candidate";
  text: string;
  mode?: "text" | "voice";
};

/* =========================================================
   CONSTANTS
========================================================= */

const FIELD_ORDER = [
  "full_name",
  "age",
  "gender",
  "address",
  "education",
  "experience_years",
  "previous_company",
];

const emptyCandidate: CandidateDetails = {
  full_name: "",
  age: null,
  gender: null,
  blood_group: null,
  phone: null,
  email: null,
  address: null,
  education: null,
  experience_years: null,
  previous_company: null,
  candidate_level: "workmen",
  photo_url: null,
};

/* =========================================================
   HELPERS
========================================================= */

function hasValue(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

function cleanText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "")
    .trim();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RoundOne() {
  const [questions, setQuestions] = useState<RoundOneQuestion[]>([]);

  const [candidate, setCandidate] =
    useState<CandidateDetails>(emptyCandidate);

  const [candidateLevel, setCandidateLevel] =
    useState<"staff" | "workmen">("workmen");

  const [messages, setMessages] =
    useState<ConversationMessage[]>([]);

  const [answer, setAnswer] = useState("");

  const [answerMode, setAnswerMode] =
    useState<"text" | "voice">("text");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [error, setError] = useState("");

  const [showSummary, setShowSummary] = useState(false);
  const [showFinalContactFields, setShowFinalContactFields] =
    useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [editForm, setEditForm] =
    useState<CandidateDetails>(emptyCandidate);

  const [showPhotoCapture, setShowPhotoCapture] =
    useState(true);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [photoUploading, setPhotoUploading] =
    useState(false);

  const [cameraReady, setCameraReady] = useState(false);

  const [roundConfirmed, setRoundConfirmed] =
    useState(false);

  const [confirming, setConfirming] = useState(false);

  const [interviewStarted, setInterviewStarted] =
    useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const candidateIdRef = useRef<string | null>(null);
  const interviewIdRef = useRef<string | null>(null);
  const roundIdRef = useRef<string | null>(null);

  const candidateRef =
    useRef<CandidateDetails>(emptyCandidate);

  const currentFieldRef =
    useRef<string | null>(null);

  const askedFieldRef =
    useRef<string | null>(null);

  const processingAnswerRef =
    useRef(false);

  const introStartedRef =
    useRef(false);

  const recognitionRef =
    useRef<any>(null);

  const recognitionRunRef =
    useRef(0);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const ttsAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const ttsRequestRef =
    useRef(0);

  const cameraVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const cameraStreamRef =
    useRef<MediaStream | null>(null);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
    Photo is captured before candidate creation.
    So keep the image locally until candidate session exists.
  */
  const pendingPhotoRef =
    useRef<File | null>(null);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    void loadInterview();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopListening();
      stopCamera();

      ttsRequestRef.current += 1;

      const audio = ttsAudioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
        ttsAudioRef.current = null;
      }
    };
  }, []);

  /* =========================================================
     LOAD QUESTIONS
  ========================================================= */

  async function loadInterview() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRoundOneQuestions();

      const loadedQuestions: RoundOneQuestion[] =
        response?.data ??
        response ??
        [];

      setQuestions(loadedQuestions);

      const freshCandidate: CandidateDetails = {
        ...emptyCandidate,
        candidate_level: "workmen",
        photo_url: null,
      };

      setCandidate(freshCandidate);
      candidateRef.current = freshCandidate;

      setCandidateLevel("workmen");

      candidateIdRef.current = null;
      interviewIdRef.current = null;
      roundIdRef.current = null;

      setMessages([]);
      setAnswer("");

      setPhotoPreview(null);
      pendingPhotoRef.current = null;

      setShowPhotoCapture(true);
      setInterviewStarted(false);
      setShowSummary(false);
      setShowFinalContactFields(false);
      setShowEdit(false);
      setRoundConfirmed(false);

      introStartedRef.current = false;
      currentFieldRef.current = null;
      askedFieldRef.current = null;
      processingAnswerRef.current = false;
    } catch (err) {
      console.error(err);
      setError(
        "Round 1 details load panna mudiyala."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     QUESTION HELPERS
  ========================================================= */

  function getQuestion(field: string) {
    return questions.find(
      (question) =>
        question.field_key === field
    );
  }

  function getNextRequiredConversationField(
    currentCandidate: CandidateDetails
  ) {
    for (const field of FIELD_ORDER) {
      // Fresher / zero-experience candidates do not need previous-company details.
      if (
        currentCandidate.experience_years === 0 &&
        field === "previous_company"
      ) {
        continue;
      }

      const value =
        currentCandidate[
        field as keyof CandidateDetails
        ];

      if (!hasValue(value)) {
        return field;
      }
    }

    return null;
  }

  /* =========================================================
     INTERVIEW SESSION
  ========================================================= */

  async function ensureInterviewSession(
    currentCandidate: CandidateDetails
  ) {
    if (
      candidateIdRef.current &&
      interviewIdRef.current &&
      roundIdRef.current
    ) {
      return {
        candidateId: candidateIdRef.current,
        interviewId: interviewIdRef.current,
        roundId: roundIdRef.current,
      };
    }

    if (!hasValue(currentCandidate.full_name)) {
      return null;
    }

    const candidateCode =
      `CAN-${Date.now()}`;

    /* -------------------------------------------------------
       CREATE CANDIDATE
    ------------------------------------------------------- */

    const candidateResponse =
      await createCandidate({
        candidateCode,
        fullName: currentCandidate.full_name,
        candidateLevel:
          currentCandidate.candidate_level ??
          candidateLevel,
      });

    const createdCandidate =
      candidateResponse?.data;

    if (!createdCandidate?.id) {
      throw new Error(
        "Candidate creation failed"
      );
    }

    const newCandidateId =
      createdCandidate.id;

    candidateIdRef.current =
      newCandidateId;

    /* -------------------------------------------------------
       CREATE INTERVIEW
    ------------------------------------------------------- */

    const interviewResponse =
      await createInterview({
        candidate_id: newCandidateId,
        job_role_id: null,
        domain_id: null,
      });

    const createdInterview =
      interviewResponse?.data;

    if (!createdInterview?.id) {
      throw new Error(
        "Interview creation failed"
      );
    }

    const newInterviewId =
      createdInterview.id;

    interviewIdRef.current =
      newInterviewId;

    /* -------------------------------------------------------
       GET ROUNDS
    ------------------------------------------------------- */

    const roundsResponse =
      await getInterviewRounds(
        newInterviewId
      );

    const rounds =
      roundsResponse?.data ??
      roundsResponse ??
      [];

    const roundOne =
      rounds.find(
        (round: {
          round_number: number;
        }) =>
          round.round_number === 1
      );

    if (!roundOne?.id) {
      throw new Error(
        "Round 1 creation failed"
      );
    }

    const newRoundId =
      roundOne.id;

    roundIdRef.current =
      newRoundId;

    /*
      If photo was captured before candidate
      creation, upload it now.
    */
    if (pendingPhotoRef.current) {
      try {
        const result =
          await uploadCandidatePhoto(
            newCandidateId,
            pendingPhotoRef.current
          );

        const photoUrl =
          result?.data?.candidate_photo_url ??
          result?.data?.photo_url ??
          null;

        if (photoUrl) {
          candidateRef.current = {
            ...candidateRef.current,
            photo_url: photoUrl,
          };

          setCandidate((prev) => ({
            ...prev,
            photo_url: photoUrl,
          }));
        }

        pendingPhotoRef.current = null;
      } catch (photoError) {
        console.error(
          "Pending photo upload failed:",
          photoError
        );
      }
    }

    return {
      candidateId: newCandidateId,
      interviewId: newInterviewId,
      roundId: newRoundId,
    };
  }

  /* =========================================================
     SAVE DETAILS
  ========================================================= */

  async function saveDetectedDetails(
    oldCandidate: CandidateDetails,
    newCandidate: CandidateDetails,
    answerMode: "text" | "voice"
  ) {
    const fieldsToSave = [
      ...FIELD_ORDER,
      "blood_group",
      "phone",
      "email",
    ];

    const changedFields = fieldsToSave.filter(
      (field) => {
        const oldValue =
          oldCandidate[
          field as keyof CandidateDetails
          ];

        const newValue =
          newCandidate[
          field as keyof CandidateDetails
          ];

        return (
          hasValue(newValue) &&
          String(oldValue ?? "") !==
          String(newValue ?? "")
        );
      }
    );

    const session =
      await ensureInterviewSession(
        newCandidate
      );

    if (!session) {
      throw new Error(
        "Interview session is not ready."
      );
    }

    await updateCandidate(
      session.candidateId,
      {
        fullName: newCandidate.full_name,
        age: newCandidate.age,
        gender: newCandidate.gender,
        bloodGroup: newCandidate.blood_group,
        phone: newCandidate.phone,
        email: newCandidate.email,
        address: newCandidate.address,
        education: newCandidate.education,
        experienceYears: newCandidate.experience_years,
        previousCompany: newCandidate.previous_company,
        candidateLevel: newCandidate.candidate_level,
      }
    );

    for (const field of changedFields) {
      const question = questions.find(
        (item) =>
          item.field_key === field
      );

      if (!question) {
        continue;
      }

      const value =
        newCandidate[
        field as keyof CandidateDetails
        ];

      if (!hasValue(value)) {
        continue;
      }

      await saveRoundOneAnswer({
        candidateId:
          session.candidateId,
        interviewId:
          session.interviewId,
        roundId:
          session.roundId,
        questionId: question.id,
        answerText: String(value),
        normalizedValue: String(value),
        answerMode,
      });
    }
  }

/* =========================================================
   CONVERSATION
========================================================= */

async function startConversation(
  level: "staff" | "workmen",
  currentCandidate: CandidateDetails
) {
  if (introStartedRef.current) {
    return;
  }

  introStartedRef.current = true;

  setInterviewStarted(true);

  candidateRef.current =
    currentCandidate;

  const welcome =
    level === "workmen"
      ? "வணக்கம்! ராஜபாளையம் மில்ஸ் நேர்காணலுக்கு உங்களை அன்புடன் வரவேற்கிறோம். இப்போது நம்ம நேர்காணலை தொடங்கலாம். நீங்கள் தமிழ் மொழியில் பதில் அளிக்கலாம். முதலில் உங்கள் அடிப்படை விவரங்களைப் பற்றி கொஞ்சம் பேசலாம். தயாராக இருக்கிறீர்களா?"
      : "Welcome to the Rajapalayam Mills interview. We will now begin with your basic information. Are you ready?";

  await addAIMessage(
    welcome,
    level
  );

  await askNextMissingField(
    currentCandidate
  );
}

async function addAIMessage(
  text: string,
  level: "staff" | "workmen" =
    candidateLevel
) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "ai",
      text,
    },
  ]);

  await speakText(text, level);
}

function addCandidateMessage(
  text: string,
  mode: "text" | "voice"
) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "candidate",
      text,
      mode,
    },
  ]);
}

async function askNextMissingField(
  currentCandidate: CandidateDetails
) {
  const missingField =
    getNextRequiredConversationField(currentCandidate);

  if (!missingField) {
    currentFieldRef.current = null;
    askedFieldRef.current = null;

    await finishConversation();
    return;
  }

  if (askedFieldRef.current === missingField) {
    return;
  }

  const question = getQuestion(missingField);

  if (!question) {
    console.error(
      "Question not found:",
      missingField
    );
    return;
  }

  currentFieldRef.current = missingField;
  askedFieldRef.current = missingField;

  const text =
    candidateLevel === "workmen"
      ? question.question_text_tamil ||
      question.question_text
      : question.question_text;

  await addAIMessage(
    text,
    candidateLevel
  );

  if (
    !showFinalContactFields &&
    !showSummary &&
    !roundConfirmed
  ) {
    setTimeout(() => {
      startListening();
    }, 500);
  }
}

/* =========================================================
   EXTRACTION
========================================================= */

function extractDetails(
  text: string,
  currentField: string | null
): Partial<CandidateDetails> {
  const result: Partial<CandidateDetails> =
    {};

  const input =
    text.trim();

  /* NAME */

  const nameMatch =
    input.match(
      /(?:my name is|my name's|name is|i am|i'm|என் பெயர்|என்னுடைய பெயர்)\s+([A-Za-z][A-Za-z .'-]{1,60})/i
    );

  if (nameMatch) {
    result.full_name =
      cleanText(nameMatch[1]);
  }

  if (
    !result.full_name &&
    currentField === "full_name"
  ) {
    const possibleName =
      cleanText(input);

    if (
      possibleName.length >= 2 &&
      !/\d/.test(possibleName) &&
      possibleName.split(" ").length <= 5
    ) {
      result.full_name =
        possibleName;
    }
  }

  /* AGE */

  const ageMatch =
    input.match(
      /(?:age|years old|வயது|வயசு)\s*(?:is|=|:)?\s*(\d{1,3})/i
    );

  if (ageMatch) {
    result.age =
      Number(ageMatch[1]);
  }

  if (
    result.age === undefined &&
    currentField === "age"
  ) {
    const n =
      input.match(
        /\b(\d{1,3})\b/
      );

    if (n) {
      const age =
        Number(n[1]);

      if (
        age >= 15 &&
        age <= 80
      ) {
        result.age = age;
      }
    }
  }

  /* GENDER */

  if (
    /\b(male|man|boy)\b/i.test(input) ||
    input.includes("ஆண்") ||
    /^(மேல்|மால்|மேன்|மெல்|மாலே)$/.test(input.trim())
  ) {
    result.gender = "male";
  }

  if (
    /\b(female|woman|girl)\b/i.test(input) ||
    input.includes("பெண்")
  ) {
    result.gender = "female";
  }

  if (
    !result.gender &&
    currentField === "gender"
  ) {
    const lower =
      input.toLowerCase();

    if (lower === "m") {
      result.gender = "male";
    }

    if (lower === "f") {
      result.gender = "female";
    }
  }

  /* ADDRESS */

  const addressMatch =
    input.match(
      /(?:my address is|address is|i live in|i am from|living in|என் முகவரி|நான் வசிப்பது)\s+(.+)/i
    );

  if (addressMatch) {
    result.address =
      cleanText(
        addressMatch[1]
      );
  }

  if (
    !result.address &&
    currentField === "address"
  ) {
    result.address =
      cleanText(input);
  }

  /* EDUCATION */

  const educationMatch =
    input.match(
      /(?:education|qualification|qualified|படிப்பு|கல்வித் தகுதி)\s*(?:is|=|:)?\s*(.+)/i
    );

  if (educationMatch) {
    result.education =
      cleanText(
        educationMatch[1]
      );
  }

  const degreeMatch =
    input.match(
      /\b(B\.?\s*Tech|B\.?\s*E|B\.?\s*Sc|BCA|MCA|M\.?\s*Tech|M\.?\s*E|MBA|Diploma|ITI|10th|12th|HSC|SSLC)(?:[A-Za-z0-9 &./-]*)/i
    );

  if (degreeMatch) {
    result.education =
      cleanText(
        degreeMatch[0]
      );
  }

  if (
    !result.education &&
    currentField === "education"
  ) {
    result.education =
      cleanText(input);
  }

  /* EXPERIENCE */

  const normalizedExperience =
    input
      .toLowerCase()
      .replace(/[.?!]+$/, "")
      .trim();

  const zeroExperience =
    /^(0|zero|none|no|nil|fresher|freshers|no experience|no work experience|ஜீரோ|சீரோ|ஜீரோ வருடம்|சீரோ வருடம்|அனுபவம் இல்லை)$/i
      .test(
        normalizedExperience
      ) ||
    input.includes("அனுபவம் இல்லை") ||
    input.includes("ஜீரோ") ||
    input.includes("சீரோ") ||
    input.includes("பூஜ்ஜியம்") ||
    input.includes("பூஜ்யம்");

  if (
    currentField ===
    "experience_years" &&
    zeroExperience
  ) {
    result.experience_years = 0;
  } else {
    const experienceMatch =
      input.match(
        /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|வருடம்|வருடங்கள்)\s*(?:of)?\s*(?:work\s*)?(?:experience)?/i
      );

    if (experienceMatch) {
      result.experience_years =
        Number(
          experienceMatch[1]
        );
    } else if (
      currentField ===
      "experience_years"
    ) {
      const n =
        input.match(
          /\b(\d+(?:\.\d+)?)\b/
        );

      if (n) {
        result.experience_years =
          Number(n[1]);
      }
    }
  }

  /* PREVIOUS COMPANY */

  const companyMatch =
    input.match(
      /(?:previous company|previous organisation|previous organization|worked at|worked in|company name|முந்தைய நிறுவனம்)\s*(?:is|=|:)?\s*(.+)/i
    );

  if (companyMatch) {
    result.previous_company =
      cleanText(
        companyMatch[1]
      );
  }

  if (
    !result.previous_company &&
    currentField ===
    "previous_company"
  ) {
    result.previous_company =
      cleanText(input);
  }

  return result;
}

function mergeDetails(
  current: CandidateDetails,
  detected: Partial<CandidateDetails>
) {
  const merged: CandidateDetails = {
    ...current,
  };

  for (const key of Object.keys(
    detected
  )) {
    const value =
      detected[
      key as keyof CandidateDetails
      ];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      (
        merged[
        key as keyof CandidateDetails
        ] as any
      ) = value;
    }
  }

  if (
    merged.experience_years === 0
  ) {
    merged.previous_company =
      null;
  }

  return merged;
}

/* =========================================================
   ANSWER SUBMIT
========================================================= */

async function handleAnswerSubmit(
  submittedAnswer?: string,
  mode: "text" | "voice" = answerMode
) {
  const text =
    (
      submittedAnswer ??
      answer
    ).trim();

  if (
    !text ||
    processingAnswerRef.current ||
    saving
  ) {
    return;
  }

  const currentCandidate =
    candidateRef.current;

  const currentField =
    currentFieldRef.current ??
    getNextRequiredConversationField(
      currentCandidate
    );

  if (!currentField) {
    return;
  }

  processingAnswerRef.current =
    true;

  try {
    setSaving(true);
    setError("");

    stopListening();

    addCandidateMessage(
      text,
      mode
    );

    const detected =
      extractDetails(
        text,
        currentField
      );

    const updatedCandidate =
      mergeDetails(
        currentCandidate,
        detected
      );

    if (
      currentField ===
      "experience_years" &&
      detected.experience_years === 0
    ) {
      updatedCandidate.experience_years =
        0;

      updatedCandidate.previous_company =
        null;
    }

    setCandidate(
      updatedCandidate
    );

    candidateRef.current =
      updatedCandidate;

    setAnswer("");
    setAnswerMode("text");

    await saveDetectedDetails(
      currentCandidate,
      updatedCandidate,
      mode
    );

    const nextField =
      getNextRequiredConversationField(
        updatedCandidate
      );

    if (!nextField) {
      currentFieldRef.current =
        null;

      askedFieldRef.current =
        null;

      await finishConversation();
      return;
    }

    currentFieldRef.current =
      nextField;

    askedFieldRef.current =
      null;

    // The next question must be allowed to start its automatic microphone.
    // Clear the processing lock before askNextMissingField() calls startListening().
    processingAnswerRef.current = false;
    setSaving(false);

    await askNextMissingField(
      updatedCandidate
    );
  } catch (err) {
    console.error(err);

    setError(
      "Answer save panna problem vandhuduchu. Please try again."
    );
  } finally {
    setSaving(false);
    processingAnswerRef.current =
      false;
  }
}

/* =========================================================
   FINAL CONTACT
========================================================= */

async function finishConversation() {
  stopListening();

  const message =
    candidateLevel === "workmen"
      ? "சரி. உங்கள் அடிப்படை விவரங்கள் அனைத்தும் சேகரிக்கப்பட்டுவிட்டன. இப்போது கீழே உங்கள் தொலைபேசி எண், மின்னஞ்சல் மற்றும் இரத்த வகையை உள்ளிடுங்கள்."
      : "Your basic details are complete. Please enter your phone number and email, and select your blood group below.";

  await addAIMessage(
    message,
    candidateLevel
  );

  setShowFinalContactFields(
    true
  );
}

async function handleFinalContactSubmit() {
  const phone =
    (
      candidate.phone ??
      ""
    ).replace(/\D/g, "");

  const email =
    (
      candidate.email ??
      ""
    ).trim();

  const bloodGroup =
    (
      candidate.blood_group ??
      ""
    ).trim();

  if (!/^\d{10}$/.test(phone)) {
    setError(
      "Phone number must contain exactly 10 digits."
    );
    return;
  }

  if (!bloodGroup) {
    setError(
      "Please select your blood group."
    );
    return;
  }

  try {
    setSaving(true);
    setError("");

    const updatedCandidate = {
      ...candidate,
      phone,
      email: email || null,
      blood_group: bloodGroup,
    };

    await saveDetectedDetails(
      candidateRef.current,
      updatedCandidate,
      "text"
    );

    candidateRef.current =
      updatedCandidate;

    setCandidate(
      updatedCandidate
    );

    setShowFinalContactFields(
      false
    );

    const message =
      candidateLevel === "workmen"
        ? "நன்றி. உங்கள் விவரங்கள் அனைத்தும் பெறப்பட்டுவிட்டன. கீழே ஒருமுறை சரிபார்த்து, தவறு இருந்தால் Edit Details மூலம் திருத்தலாம்."
        : "Thank you. Your details have been collected. Please review the information below.";

    await addAIMessage(
      message,
      candidateLevel
    );

    setShowSummary(true);
  } catch (err) {
    console.error(err);

    setError(
      "Contact details save panna mudiyala. Please try again."
    );
  } finally {
    setSaving(false);
  }
}

/* =========================================================
   TTS
========================================================= */

async function speakText(
  text: string,
  level: "staff" | "workmen" =
    candidateLevel
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const clean =
    text.trim();

  if (!clean) {
    return;
  }

  const previousAudio =
    ttsAudioRef.current;

  if (previousAudio) {
    previousAudio.pause();
    previousAudio.currentTime = 0;
    previousAudio.src = "";
    ttsAudioRef.current = null;
  }

  const requestId =
    ++ttsRequestRef.current;

  try {
    const voice =
      level === "workmen"
        ? "ta-IN-PallaviNeural"
        : "en-IN-NeerjaNeural";

    const response =
      await fetch(
        "https://mill-recruitment-ai-1.onrender.com/tts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: clean,
            voice,
          }),
        }
      );

    if (!response.ok) {
      return;
    }

    const blob =
      await response.blob();

    const url =
      URL.createObjectURL(blob);

    if (
      requestId !==
      ttsRequestRef.current
    ) {
      URL.revokeObjectURL(url);
      return;
    }

    const audio =
      new Audio(url);

    ttsAudioRef.current =
      audio;

    await new Promise<void>(
      (resolve) => {
        let finished = false;

        const done = () => {
          if (finished) {
            return;
          }

          finished = true;

          if (
            ttsAudioRef.current ===
            audio
          ) {
            ttsAudioRef.current =
              null;
          }

          URL.revokeObjectURL(
            url
          );

          resolve();
        };

        audio.onended = done;
        audio.onerror = done;
        audio.onabort = done;

        void audio
          .play()
          .catch((err) => {
            console.error(
              "TTS play blocked:",
              err
            );

            done();
          });
      }
    );
  } catch (err) {
    console.warn(
      "TTS unavailable:",
      err
    );
  }
}

/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function startListening() {
  if (
    processingAnswerRef.current ||
    showFinalContactFields ||
    showSummary ||
    roundConfirmed
  ) {
    return;
  }

  try {
    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Browser speech recognition support illa."
      );
      return;
    }

    const runId =
      ++recognitionRunRef.current;

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      candidateLevel === "workmen"
        ? "ta-IN"
        : "en-IN";

    recognition.interimResults =
      false;

    recognition.continuous =
      false;

    recognition.maxAlternatives =
      1;

    recognition.onstart = () => {
      if (
        runId ===
        recognitionRunRef.current
      ) {
        setIsListening(true);
      }
    };

    recognition.onresult =
      (event: any) => {
        if (
          runId !==
          recognitionRunRef.current
        ) {
          return;
        }

        const transcript =
          event.results?.[0]?.[0]
            ?.transcript ?? "";

        if (!transcript.trim()) {
          return;
        }

        setAnswer(transcript);
        setAnswerMode("voice");

        void handleAnswerSubmit(
          transcript,
          "voice"
        );
      };

    recognition.onerror =
      (event: any) => {
        if (
          runId !==
          recognitionRunRef.current
        ) {
          return;
        }

        console.error(
          "Speech recognition error:",
          event
        );

        if (
          event?.error !==
          "aborted" &&
          event?.error !==
          "no-speech"
        ) {
          setError(
            "Voice answer capture panna mudiyala."
          );
        }
      };

    recognition.onend = () => {
      if (
        runId ===
        recognitionRunRef.current
      ) {
        setIsListening(false);
      }
    };

    recognitionRef.current =
      recognition;

    recognition.start();
  } catch (err) {
    console.error(err);
    setIsListening(false);
  }
}

function stopListening() {
  recognitionRunRef.current +=
    1;

  try {
    recognitionRef.current?.stop();
  } catch {
    // ignore
  }

  recognitionRef.current =
    null;

  setIsListening(false);
}

/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {
  try {
    setError("");

    if (
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError(
        "Camera support illa. Upload Photo option use pannunga."
      );
      return;
    }

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          video: {
            facingMode: "user",
          },
          audio: false,
        }
      );

    cameraStreamRef.current =
      stream;

    setCameraReady(true);

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject =
        stream;

      await cameraVideoRef.current.play();
    }
  } catch (err) {
    console.error(err);

    setError(
      "Camera permission allow pannunga, illa Upload Photo use pannunga."
    );
  }
}

function stopCamera() {
  cameraStreamRef.current
    ?.getTracks()
    .forEach((track) =>
      track.stop()
    );

  cameraStreamRef.current =
    null;

  setCameraReady(false);

  if (cameraVideoRef.current) {
    cameraVideoRef.current.srcObject =
      null;
  }
}

function dataUrlToFile(
  dataUrl: string
) {
  const arr =
    dataUrl.split(",");

  const mime =
    arr[0].match(
      /:(.*?);/
    )?.[1] ??
    "image/jpeg";

  const bstr =
    atob(arr[1]);

  let n = bstr.length;

  const u8arr =
    new Uint8Array(n);

  while (n--) {
    u8arr[n] =
      bstr.charCodeAt(n);
  }

  return new File(
    [u8arr],
    "candidate-photo.jpg",
    {
      type: mime,
    }
  );
}

function capturePhoto() {
  const video =
    cameraVideoRef.current;

  if (
    !video ||
    video.videoWidth === 0
  ) {
    setError(
      "Camera ready illa. Konjam wait panni try pannunga."
    );
    return;
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  const context =
    canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const dataUrl =
    canvas.toDataURL(
      "image/jpeg",
      0.82
    );

  setPhotoPreview(dataUrl);

  pendingPhotoRef.current =
    dataUrlToFile(dataUrl);

  stopCamera();
}

async function confirmPhoto() {
  if (
    !photoPreview ||
    photoUploading
  ) {
    return;
  }

  try {
    setPhotoUploading(true);
    setError("");

    /*
      Candidate doesn't exist yet.
      So keep photo locally and upload after
      candidate is created.
    */

    if (
      !pendingPhotoRef.current
    ) {
      pendingPhotoRef.current =
        dataUrlToFile(
          photoPreview
        );
    }

    const updatedCandidate =
    {
      ...candidateRef.current,
      photo_url:
        photoPreview,
    };

    candidateRef.current =
      updatedCandidate;

    setCandidate(
      updatedCandidate
    );

    setShowPhotoCapture(
      false
    );

    await startConversation(
      candidateLevel,
      updatedCandidate
    );
  } catch (err) {
    console.error(err);

    setError(
      "Photo save panna mudiyala."
    );
  } finally {
    setPhotoUploading(false);
  }
}

function handlePhotoFile(
  event: ChangeEvent<HTMLInputElement>
) {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    setError(
      "JPG / PNG image mattum upload pannunga."
    );
    return;
  }

  pendingPhotoRef.current =
    file;

  const reader =
    new FileReader();

  reader.onload = () => {
    setPhotoPreview(
      String(
        reader.result
      )
    );

    stopCamera();
  };

  reader.readAsDataURL(file);
}

/* =========================================================
   EDIT
========================================================= */

function openEdit() {
  setEditForm({
    ...candidate,
  });

  setShowEdit(true);
}

async function handleEditSave() {
  if (
    !editForm.full_name.trim()
  ) {
    setError(
      "Name required."
    );
    return;
  }

  const candidateId =
    candidateIdRef.current;

  if (!candidateId) {
    setError(
      "Candidate session is not ready."
    );
    return;
  }

  try {
    setSaving(true);
    setError("");

    const updated = {
      ...editForm,

      full_name:
        editForm.full_name.trim(),

      previous_company:
        editForm.experience_years ===
          0
          ? null
          : editForm.previous_company,
    };

    await updateCandidate(
      candidateId,
      {
        fullName:
          updated.full_name,

        age:
          updated.age,

        gender:
          updated.gender,

        bloodGroup:
          updated.blood_group,

        phone:
          updated.phone,

        email:
          updated.email,

        address:
          updated.address,

        education:
          updated.education,

        experienceYears:
          updated.experience_years,

        previousCompany:
          updated.previous_company,

        candidateLevel:
          updated.candidate_level,
      }
    );

    setCandidate(updated);

    candidateRef.current =
      updated;

    setShowEdit(false);

    await addAIMessage(
      candidateLevel ===
        "workmen"
        ? "Unga details successfully update panniyachu."
        : "Your details have been updated successfully."
    );
  } catch (err) {
    console.error(err);

    setError(
      "Details update panna mudiyala."
    );
  } finally {
    setSaving(false);
  }
}

/* =========================================================
   CONFIRM ROUND 1
========================================================= */

async function handleConfirm() {
  if (
    confirming ||
    roundConfirmed
  ) {
    return;
  }

  const candidateId =
    candidateIdRef.current;

  const interviewId =
    interviewIdRef.current;

  const roundId =
    roundIdRef.current;

  if (
    !candidateId ||
    !interviewId ||
    !roundId
  ) {
    setError(
      "Interview session is not ready."
    );
    return;
  }

  try {
    setConfirming(true);
    setError("");

    const result =
      await confirmRoundOne({
        candidateId,
        interviewId,
        roundId,
      });

    setRoundConfirmed(true);

    const nextRound =
      result?.data?.nextRound ??
      result?.nextRound;

    await addAIMessage(
      candidateLevel ===
        "workmen"
        ? "நன்றி. உங்கள் அடிப்படை விவரங்கள் உறுதிப்படுத்தப்பட்டுவிட்டன. Round 1 முடிந்துவிட்டது. தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்."
        : "Thank you. Your basic details have been confirmed. Round 1 is complete. Please wait for the next stage."
    );

    console.log(
      "Next round:",
      nextRound
    );
  } catch (err: any) {
    console.error(err);

    setError(
      err?.message ??
      "Round 1 confirm panna mudiyala."
    );
  } finally {
    setConfirming(false);
  }
}

/* =========================================================
   DISPLAY HELPERS
========================================================= */

function formatExperience(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (value === 0) {
    return "Fresher";
  }

  return `${value} year${value === 1 ? "" : "s"
    }`;
}

function displayValue(
  value: unknown
) {
  return hasValue(value)
    ? String(value)
    : "—";
}

/* =========================================================
   LOADING
========================================================= */

if (loading) {
  return (
    <div style={styles.page}>
      <div
        style={styles.loadingCard}
      >
        <div
          style={styles.loadingIcon}
        >
          RM
        </div>

        <h2
          style={styles.loadingTitle}
        >
          Loading Interview
        </h2>

        <p
          style={styles.loadingText}
        >
          Rajapalayam Mills AI
          Interview prepare
          pannitu irukku...
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   UI
========================================================= */

return (
  <div style={styles.page}>
    <div style={styles.container}>

      {/* =================================================
            PHOTO GATE
        ================================================= */}

      {showPhotoCapture ? (
        <section
          style={styles.photoGate}
        >
          <div
            style={
              styles.photoGateBadge
            }
          >
            CANDIDATE VERIFICATION
          </div>

          <h1
            style={
              styles.photoGateTitle
            }
          >
            Take your interview
            photo
          </h1>

          <p
            style={styles.photoGateText}
          >
            Interview start
            pannurathukku
            munnaadi oru clear
            photo capture
            pannunga. HR candidate
            profile-la indha photo
            display aagum.
          </p>

          <div
            style={styles.cameraFrame}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Candidate preview"
                style={
                  styles.cameraImage
                }
              />
            ) : (
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                style={
                  styles.cameraVideo
                }
              />
            )}
          </div>

          <div
            style={styles.photoActions}
          >
            {!photoPreview && (
              <button
                type="button"
                onClick={() =>
                  void startCamera()
                }
                style={
                  styles.primaryPhotoButton
                }
              >
                📷 Open Camera
              </button>
            )}

            {!photoPreview &&
              cameraReady && (
                <button
                  type="button"
                  onClick={
                    capturePhoto
                  }
                  style={
                    styles.confirmPhotoButton
                  }
                >
                  📸 Capture Photo
                </button>
              )}

            {photoPreview && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(
                      null
                    );

                    pendingPhotoRef.current =
                      null;

                    void startCamera();
                  }}
                  style={
                    styles.editButton
                  }
                >
                  ↻ Retake
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void confirmPhoto()
                  }
                  disabled={
                    photoUploading
                  }
                  style={
                    styles.confirmButton
                  }
                >
                  {photoUploading
                    ? "Preparing..."
                    : "✓ Continue"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                photoInputRef.current?.click()
              }
              style={
                styles.uploadPhotoButton
              }
            >
              Upload Photo
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={
                handlePhotoFile
              }
              style={{
                display: "none",
              }}
            />
          </div>

          <div
            style={
              styles.photoConsent
            }
          >
            இந்த புகைப்படம்
            நேர்காணல் பதிவிற்காக
            பயன்படுத்தப்படும்.
          </div>

          {error && (
            <div
              style={styles.errorBox}
            >
              {error}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* =================================================
                HEADER
            ================================================= */}

          <header
            style={styles.header}
          >
            <div>
              <div
                style={styles.brand}
              >
                RAJAPALAYAM MILLS
              </div>

              <div
                style={
                  styles.subBrand
                }
              >
                AI RECRUITMENT
                INTERVIEW
              </div>
            </div>

            <div
              style={
                styles.roundBadge
              }
            >
              <span
                style={
                  styles.roundBadgeSpan
                }
              >
                ROUND 1
              </span>

              <small>
                Basic Information
              </small>
            </div>
          </header>

          {/* =================================================
                ERROR
            ================================================= */}

          {error && (
            <div
              style={styles.errorBox}
            >
              {error}
            </div>
          )}

          {/* =================================================
                START
            ================================================= */}

          {!interviewStarted &&
            !roundConfirmed && (
              <section
                style={
                  styles.startCard
                }
              >
                <div
                  style={
                    styles.sectionLabel
                  }
                >
                  READY TO BEGIN
                </div>

                <h2
                  style={
                    styles.startTitle
                  }
                >
                  Start your interview
                </h2>

                <p
                  style={
                    styles.summarySubtitle
                  }
                >
                  Start button press
                  pannumbodhu welcome
                  voice first play
                  aagum. Adhukku apram
                  AI automatic-ah next
                  question kekkum.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void startConversation(
                      candidateLevel,
                      candidateRef.current
                    )
                  }
                  style={
                    styles.confirmButton
                  }
                >
                  ▶ Start Interview
                </button>
              </section>
            )}

          {/* =================================================
                PROGRESS
            ================================================= */}

          <div
            style={
              styles.progressArea
            }
          >
            <div
              style={
                styles.progressTop
              }
            >
              <span>
                Basic Information
              </span>

              <span>
                Round 1 of 2
              </span>
            </div>

            <div
              style={
                styles.progressTrack
              }
            >
              <div
                style={{
                  ...styles.progressFill,
                  width:
                    roundConfirmed
                      ? "100%"
                      : showSummary
                        ? "90%"
                        : "45%",
                }}
              />
            </div>
          </div>

          {/* =================================================
                CONVERSATION
            ================================================= */}

          {!roundConfirmed &&
            interviewStarted && (
              <section
                style={
                  styles.conversationCard
                }
              >
                <div
                  style={
                    styles.conversationHeader
                  }
                >
                  <div>
                    <div
                      style={
                        styles.sectionLabel
                      }
                    >
                      AI CONVERSATION
                    </div>

                    <h2
                      style={
                        styles.sectionTitle
                      }
                    >
                      Basic Details
                      Interview
                    </h2>
                  </div>

                  <div
                    style={
                      styles.liveIndicator
                    }
                  >
                    <span
                      style={
                        styles.liveDot
                      }
                    />
                    LIVE
                  </div>
                </div>

                <div
                  style={
                    styles.messages
                  }
                >
                  {messages.map(
                    (message) => (
                      <div
                        key={
                          message.id
                        }
                        style={
                          message.role ===
                            "ai"
                            ? styles.aiRow
                            : styles.candidateRow
                        }
                      >
                        <div
                          style={
                            message.role ===
                              "ai"
                              ? styles.aiAvatar
                              : styles.candidateAvatar
                          }
                        >
                          {message.role ===
                            "ai"
                            ? "AI"
                            : "YOU"}
                        </div>

                        <div
                          style={
                            message.role ===
                              "ai"
                              ? styles.aiBubble
                              : styles.candidateBubble
                          }
                        >
                          <div
                            style={
                              message.role ===
                                "ai"
                                ? styles.messageRole
                                : styles.messageRoleCandidate
                            }
                          >
                            {message.role ===
                              "ai"
                              ? "Rajapalayam Mills AI"
                              : "Candidate"}
                          </div>

                          <div
                            style={
                              styles.messageText
                            }
                          >
                            {
                              message.text
                            }
                          </div>

                          {message.mode ===
                            "voice" && (
                              <div
                                style={
                                  styles.voiceTag
                                }
                              >
                                🎙 Voice Answer
                              </div>
                            )}
                        </div>
                      </div>
                    )
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>

                {!showSummary &&
                  !showFinalContactFields && (
                    <div
                      style={
                        styles.answerArea
                      }
                    >
                      <textarea
                        value={answer}
                        onChange={(e) =>
                          setAnswer(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            "Enter" &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();

                            void handleAnswerSubmit(
                              answer,
                              "text"
                            );
                          }
                        }}
                        placeholder={
                          candidateLevel ===
                            "workmen"
                            ? "Unga answer-a inga type pannunga..."
                            : "Type your answer here..."
                        }
                        disabled={
                          saving ||
                          isListening
                        }
                        style={
                          styles.textarea
                        }
                      />

                      <div
                        style={
                          styles.answerActions
                        }
                      >
                        <button
                          type="button"
                          onClick={
                            isListening
                              ? stopListening
                              : startListening
                          }
                          disabled={
                            saving
                          }
                          style={
                            isListening
                              ? styles.stopVoiceButton
                              : styles.voiceButton
                          }
                        >
                          {isListening
                            ? "⏹ Stop"
                            : "🎙 Speak"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleAnswerSubmit(
                              answer,
                              "text"
                            )
                          }
                          disabled={
                            saving ||
                            !answer.trim()
                          }
                          style={
                            styles.sendButton
                          }
                        >
                          {saving
                            ? "Saving..."
                            : "Send"}
                        </button>
                      </div>

                      {isListening && (
                        <div
                          style={
                            styles.listeningText
                          }
                        >
                          🎙 AI listening...
                          Speak now.
                        </div>
                      )}
                    </div>
                  )}
              </section>
            )}

          {/* =================================================
                CONTACT
            ================================================= */}

          {showFinalContactFields &&
            !showSummary && (
              <section
                style={
                  styles.finalContactCard
                }
              >
                <div
                  style={
                    styles.sectionLabel
                  }
                >
                  FINAL BASIC DETAILS
                </div>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Contact & Blood Group
                </h2>

                <p
                  style={
                    styles.summarySubtitle
                  }
                >
                  Phone and email
                  typing-la enter
                  pannunga. Blood group
                  dropdown-la select
                  pannunga.
                </p>

                <div
                  style={
                    styles.formGrid
                  }
                >
                  <EditField
                    label="Phone Number *"
                    value={
                      candidate.phone ??
                      ""
                    }
                    onChange={(value) =>
                      setCandidate({
                        ...candidate,
                        phone:
                          value.replace(
                            /\D/g,
                            ""
                          ).slice(
                            0,
                            10
                          ) || null,
                      })
                    }
                  />

                  <EditField
                    label="Email"
                    type="email"
                    value={
                      candidate.email ??
                      ""
                    }
                    onChange={(value) =>
                      setCandidate({
                        ...candidate,
                        email:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditSelect
                    label="Blood Group *"
                    value={
                      candidate.blood_group ??
                      ""
                    }
                    options={[
                      "",
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                      "Unknown",
                    ]}
                    onChange={(value) =>
                      setCandidate({
                        ...candidate,
                        blood_group:
                          value ||
                          null,
                      })
                    }
                  />
                </div>

                <div
                  style={
                    styles.summaryActions
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCandidate({
                        ...candidate,
                        phone: null,
                        email: null,
                        blood_group:
                          null,
                      })
                    }
                    style={
                      styles.editButton
                    }
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleFinalContactSubmit()
                    }
                    disabled={saving}
                    style={
                      styles.confirmButton
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Continue →"}
                  </button>
                </div>
              </section>
            )}

          {/* =================================================
                SUMMARY
            ================================================= */}

          {showSummary &&
            !roundConfirmed && (
              <section
                style={
                  styles.summaryCard
                }
              >
                <div
                  style={
                    styles.summaryHeader
                  }
                >
                  <div
                    style={
                      styles.summaryIdentity
                    }
                  >
                    {candidate.photo_url ||
                      photoPreview ? (
                      <img
                        src={
                          photoPreview ||
                          (candidate.photo_url
                            ? candidate.photo_url.startsWith("http")
                              ? candidate.photo_url
                              : `http://localhost:5000${candidate.photo_url}`
                            : "")
                        }
                        alt="Candidate"
                        style={
                          styles.summaryPhoto
                        }
                      />
                    ) : (
                      <div
                        style={
                          styles.summaryPhotoPlaceholder
                        }
                      >
                        PHOTO
                      </div>
                    )}

                    <div>
                      <div
                        style={
                          styles.sectionLabel
                        }
                      >
                        CANDIDATE
                      </div>

                      <div
                        style={
                          styles.summaryName
                        }
                      >
                        {displayValue(
                          candidate.full_name
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      style={
                        styles.sectionLabel
                      }
                    >
                      REVIEW
                    </div>

                    <h2
                      style={
                        styles.sectionTitle
                      }
                    >
                      Candidate Details
                    </h2>

                    <p
                      style={
                        styles.summarySubtitle
                      }
                    >
                      Unga details once
                      confirm pannunga.
                    </p>
                  </div>

                  <div
                    style={
                      styles.checkIcon
                    }
                  >
                    ✓
                  </div>
                </div>

                <div
                  style={
                    styles.detailsGrid
                  }
                >
                  <DetailItem
                    label="Name"
                    value={displayValue(
                      candidate.full_name
                    )}
                  />

                  <DetailItem
                    label="Age"
                    value={displayValue(
                      candidate.age
                    )}
                  />

                  <DetailItem
                    label="Gender"
                    value={displayValue(
                      candidate.gender
                    )}
                  />

                  <DetailItem
                    label="Blood Group"
                    value={displayValue(
                      candidate.blood_group
                    )}
                  />

                  <DetailItem
                    label="Phone"
                    value={displayValue(
                      candidate.phone
                    )}
                  />

                  <DetailItem
                    label="Email"
                    value={displayValue(
                      candidate.email
                    )}
                  />

                  <DetailItem
                    label="Address"
                    value={displayValue(
                      candidate.address
                    )}
                    fullWidth
                  />

                  <DetailItem
                    label="Education"
                    value={displayValue(
                      candidate.education
                    )}
                  />

                  <DetailItem
                    label="Experience"
                    value={formatExperience(
                      candidate.experience_years
                    )}
                  />

                  {candidate.experience_years !==
                    0 && (
                      <DetailItem
                        label="Previous Company"
                        value={displayValue(
                          candidate.previous_company
                        )}
                      />
                    )}
                </div>

                <div
                  style={
                    styles.summaryActions
                  }
                >
                  <button
                    type="button"
                    onClick={openEdit}
                    style={
                      styles.editButton
                    }
                  >
                    ✏ Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleConfirm()
                    }
                    disabled={confirming}
                    style={
                      styles.confirmButton
                    }
                  >
                    {confirming
                      ? "Confirming..."
                      : "✓ Confirm & Continue"}
                  </button>
                </div>
              </section>
            )}

          {/* =================================================
                COMPLETED
            ================================================= */}

          {roundConfirmed && (
            <section
              style={
                styles.completedCard
              }
            >
              <div
                style={
                  styles.completedIcon
                }
              >
                ✓
              </div>

              <div
                style={
                  styles.sectionLabel
                }
              >
                ROUND 1 COMPLETED
              </div>

              <h2
                style={
                  styles.completedTitle
                }
              >
                Basic Information
                Completed
              </h2>

              <p
                style={
                  styles.completedText
                }
              >
                Unga basic details
                successfully confirm
                aayiduchu.
              </p>

              <div
                style={
                  styles.nextRoundCard
                }
              >
                <div>
                  <div
                    style={
                      styles.nextRoundLabel
                    }
                  >
                    NEXT
                  </div>

                  <div
                    style={
                      styles.nextRoundTitle
                    }
                  >
                    Round 2 —
                    Technical Interview
                  </div>

                  <div
                    style={
                      styles.nextRoundText
                    }
                  >
                    Domain-based technical
                    questions will be
                    asked in the next
                    round.
                  </div>
                </div>

                <button
                  type="button"
                  style={
                    styles.continueButton
                  }
                  onClick={() =>
                    console.log(
                      "Continue to Round 2"
                    )
                  }
                >
                  Continue →
                </button>
              </div>
            </section>
          )}

          {/* =================================================
                EDIT MODAL
            ================================================= */}

          {showEdit && (
            <div
              style={
                styles.modalOverlay
              }
            >
              <div
                style={styles.modal}
              >
                <div
                  style={
                    styles.modalHeader
                  }
                >
                  <div>
                    <div
                      style={
                        styles.sectionLabel
                      }
                    >
                      EDIT
                    </div>

                    <h2
                      style={
                        styles.modalTitle
                      }
                    >
                      Candidate Details
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowEdit(false)
                    }
                    style={
                      styles.closeButton
                    }
                  >
                    ×
                  </button>
                </div>

                <div
                  style={
                    styles.formGrid
                  }
                >
                  <EditField
                    label="Full Name"
                    value={
                      editForm.full_name
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        full_name:
                          value,
                      })
                    }
                  />

                  <EditField
                    label="Age"
                    type="number"
                    value={
                      editForm.age ===
                        null
                        ? ""
                        : String(
                          editForm.age
                        )
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        age:
                          value === ""
                            ? null
                            : Number(
                              value
                            ),
                      })
                    }
                  />

                  <EditSelect
                    label="Gender"
                    value={
                      editForm.gender ??
                      ""
                    }
                    options={[
                      "",
                      "male",
                      "female",
                    ]}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        gender:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditSelect
                    label="Blood Group"
                    value={
                      editForm.blood_group ??
                      ""
                    }
                    options={[
                      "",
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                      "Unknown",
                    ]}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        blood_group:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditField
                    label="Phone"
                    value={
                      editForm.phone ??
                      ""
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        phone:
                          value.replace(
                            /\D/g,
                            ""
                          ).slice(
                            0,
                            10
                          ) || null,
                      })
                    }
                  />

                  <EditField
                    label="Email"
                    type="email"
                    value={
                      editForm.email ??
                      ""
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        email:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditField
                    label="Address"
                    value={
                      editForm.address ??
                      ""
                    }
                    fullWidth
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        address:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditField
                    label="Education"
                    value={
                      editForm.education ??
                      ""
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        education:
                          value ||
                          null,
                      })
                    }
                  />

                  <EditSelect
                    label="Experience"
                    value={
                      editForm.experience_years ===
                        null
                        ? ""
                        : String(
                          editForm.experience_years
                        )
                    }
                    options={[
                      "",
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                    ]}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        experience_years:
                          value ===
                            ""
                            ? null
                            : Number(
                              value
                            ),
                        previous_company:
                          value ===
                            "0"
                            ? null
                            : editForm.previous_company,
                      })
                    }
                  />

                  <EditField
                    label="Previous Company"
                    value={
                      editForm.previous_company ??
                      ""
                    }
                    disabled={
                      editForm.experience_years ===
                      0
                    }
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        previous_company:
                          value ||
                          null,
                      })
                    }
                  />
                </div>

                <div
                  style={
                    styles.modalActions
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowEdit(false)
                    }
                    style={
                      styles.cancelButton
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleEditSave()
                    }
                    disabled={saving}
                    style={
                      styles.saveButton
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer
            style={styles.footer}
          >
            Rajapalayam Mills Limited
            • AI Recruitment System
          </footer>
        </>
      )}
    </div>
  </div>
  );

}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.detailItem,
        ...(fullWidth
          ? styles.detailFullWidth
          : {}),
      }}
    >
      <div
        style={styles.detailLabel}
      >
        {label}
      </div>

      <div
        style={styles.detailValue}
      >
        {value}
      </div>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <label
      style={{
        ...styles.field,
        ...(fullWidth
          ? styles.fieldFullWidth
          : {}),
      }}
    >
      <span
        style={styles.fieldLabel}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={{
          ...styles.input,
          ...(disabled
            ? styles.inputDisabled
            : {}),
        }}
      />
    </label>
  );
}

function EditSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label
      style={styles.field}
    >
      <span
        style={styles.fieldLabel}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={styles.input}
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option ||
                `Select ${label}`}
            </option>
          )
        )}
      </select>
    </label>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #080d16 0%, #101722 50%, #080d16 100%)",
    color: "#f4f1e8",
    padding: "32px 18px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  brand: {
    color: "#d7b46a",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "2px",
  },

  subBrand: {
    marginTop: "5px",
    color: "#7f8999",
    fontSize: "11px",
    letterSpacing: "2px",
  },

  roundBadge: {
    border:
      "1px solid #5d4b29",
    background:
      "rgba(215,180,106,0.08)",
    padding: "10px 15px",
    borderRadius: "10px",
    textAlign: "right",
  },

  roundBadgeSpan: {
    display: "block",
    color: "#d7b46a",
    fontSize: "11px",
    fontWeight: 800,
  },

  progressArea: {
    marginBottom: "22px",
  },

  progressTop: {
    display: "flex",
    justifyContent:
      "space-between",
    color: "#8e98a7",
    fontSize: "12px",
    marginBottom: "8px",
  },

  progressTrack: {
    height: "5px",
    background: "#202936",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background:
      "linear-gradient(90deg, #9b7636, #e1c27b)",
    borderRadius: "999px",
    transition:
      "width 0.4s ease",
  },

  errorBox: {
    padding: "12px 15px",
    background:
      "rgba(180,50,50,0.12)",
    border:
      "1px solid rgba(230,90,90,0.35)",
    borderRadius: "10px",
    color: "#ff9d9d",
    marginBottom: "18px",
    fontSize: "13px",
  },

  startCard: {
    background:
      "linear-gradient(180deg, #151e29, #0f161f)",
    border:
      "1px solid #303b49",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "22px",
    textAlign: "center",
  },

  startTitle: {
    margin: "5px 0 8px",
    fontSize: "27px",
  },

  conversationCard: {
    background:
      "linear-gradient(180deg, rgba(20,28,39,0.98), rgba(13,19,28,0.98))",
    border:
      "1px solid #273241",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.35)",
  },

  conversationHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "24px 26px",
    borderBottom:
      "1px solid #252f3c",
  },

  sectionLabel: {
    color: "#b58b45",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "2px",
    marginBottom: "6px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
  },

  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#78d49a",
    fontSize: "11px",
    fontWeight: 700,
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#54c87b",
    boxShadow:
      "0 0 10px rgba(84,200,123,0.8)",
  },

  messages: {
    padding: "26px",
    minHeight: "420px",
    maxHeight: "570px",
    overflowY: "auto",
  },

  aiRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  candidateRow: {
    display: "flex",
    flexDirection:
      "row-reverse",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  aiAvatar: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #8f6a31, #d5b36b)",
    color: "#17120a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 900,
  },

  candidateAvatar: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#263140",
    color: "#dbe3ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 900,
  },

  aiBubble: {
    maxWidth: "78%",
    background: "#1a2330",
    border:
      "1px solid #2a3544",
    borderRadius:
      "4px 14px 14px 14px",
    padding: "14px 16px",
  },

  candidateBubble: {
    maxWidth: "78%",
    background:
      "linear-gradient(135deg, #745a2e, #8f713d)",
    border:
      "1px solid #a48149",
    borderRadius:
      "14px 4px 14px 14px",
    padding: "14px 16px",
  },

  messageRole: {
    color: "#d7b46a",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "5px",
    letterSpacing: "0.8px",
  },

  messageRoleCandidate: {
    color: "#eadbb9",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "5px",
    letterSpacing: "0.8px",
  },

  messageText: {
    color: "#edf1f5",
    fontSize: "14px",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },

  voiceTag: {
    marginTop: "8px",
    fontSize: "10px",
    color: "#e8d5a8",
  },

  answerArea: {
    padding: "20px 26px 25px",
    borderTop:
      "1px solid #252f3c",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    resize: "vertical",
    boxSizing: "border-box",
    border:
      "1px solid #354252",
    background: "#0d141d",
    color: "#f2f4f7",
    outline: "none",
    padding: "14px",
    fontSize: "14px",
    lineHeight: 1.5,
    borderRadius: "12px",
  },

  answerActions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
    marginTop: "12px",
  },

  voiceButton: {
    border:
      "1px solid #4a5868",
    background: "#18212c",
    color: "#dce4ed",
    borderRadius: "9px",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: 700,
  },

  stopVoiceButton: {
    border:
      "1px solid #8c4444",
    background: "#3a2020",
    color: "#ffb3b3",
    borderRadius: "9px",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: 700,
  },

  sendButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #b08a48, #d7b46a)",
    color: "#17120a",
    borderRadius: "9px",
    padding: "11px 23px",
    cursor: "pointer",
    fontWeight: 800,
  },

  listeningText: {
    marginTop: "10px",
    color: "#78d49a",
    fontSize: "11px",
    textAlign: "right",
  },

  finalContactCard: {
    background:
      "linear-gradient(180deg, #151e29, #0f161f)",
    border:
      "1px solid #303b49",
    borderRadius: "18px",
    padding: "28px",
    marginTop: "22px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.35)",
  },

  summaryCard: {
    background:
      "linear-gradient(180deg, #151e29, #0f161f)",
    border:
      "1px solid #303b49",
    borderRadius: "18px",
    padding: "28px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.35)",
  },

  summaryHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  summaryIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  summaryPhoto: {
    width: "72px",
    height: "72px",
    borderRadius: "12px",
    objectFit: "cover",
    border:
      "1px solid #5d4b29",
  },

  summaryPhotoPlaceholder: {
    width: "72px",
    height: "72px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111923",
    border:
      "1px solid #354252",
    color: "#687587",
    fontSize: "10px",
  },

  summaryName: {
    color: "#f2f4f6",
    fontSize: "18px",
    fontWeight: 800,
  },

  summarySubtitle: {
    color: "#8f9baa",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "8px 0 0",
  },

  checkIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background:
      "rgba(80,180,110,0.14)",
    border:
      "1px solid rgba(100,200,130,0.35)",
    color: "#82dc9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 800,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "10px",
  },

  detailItem: {
    background: "#111923",
    border:
      "1px solid #263241",
    borderRadius: "10px",
    padding: "14px",
  },

  detailFullWidth: {
    gridColumn: "1 / -1",
  },

  detailLabel: {
    color: "#788493",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    marginBottom: "6px",
  },

  detailValue: {
    color: "#edf1f5",
    fontSize: "14px",
    fontWeight: 600,
    wordBreak: "break-word",
  },

  summaryActions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  editButton: {
    border:
      "1px solid #536171",
    background: "#18212c",
    color: "#e1e7ed",
    borderRadius: "9px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  confirmButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #a97e35, #d7b46a)",
    color: "#161108",
    borderRadius: "9px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 800,
  },

  completedCard: {
    background:
      "linear-gradient(180deg, #151e29, #0f161f)",
    border:
      "1px solid #30404b",
    borderRadius: "18px",
    padding: "42px 30px",
    textAlign: "center",
  },

  completedIcon: {
    width: "62px",
    height: "62px",
    margin: "0 auto 18px",
    borderRadius: "50%",
    background:
      "rgba(80,180,110,0.14)",
    border:
      "1px solid rgba(100,200,130,0.35)",
    color: "#82dc9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: 800,
  },

  completedTitle: {
    margin: "5px 0 8px",
    fontSize: "27px",
  },

  completedText: {
    color: "#8f9baa",
    fontSize: "14px",
  },

  nextRoundCard: {
    marginTop: "28px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    textAlign: "left",
    background: "#111923",
    border:
      "1px solid #2b3745",
    borderRadius: "13px",
    padding: "20px",
  },

  nextRoundLabel: {
    color: "#b58b45",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.5px",
  },

  nextRoundTitle: {
    color: "#f2f4f6",
    fontSize: "17px",
    fontWeight: 700,
    marginTop: "5px",
  },

  nextRoundText: {
    color: "#8995a4",
    fontSize: "12px",
    marginTop: "5px",
  },

  continueButton: {
    flexShrink: 0,
    border: "none",
    background:
      "linear-gradient(135deg, #a97e35, #d7b46a)",
    color: "#17120a",
    borderRadius: "9px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 800,
  },

  photoGate: {
    maxWidth: "620px",
    margin: "0 auto",
    padding: "34px",
    borderRadius: "20px",
    background:
      "linear-gradient(180deg, #151e29, #0f161f)",
    border:
      "1px solid #303b49",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.35)",
    textAlign: "center",
  },

  photoGateBadge: {
    color: "#b58b45",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  photoGateTitle: {
    margin: 0,
    color: "#f4f1e8",
    fontSize: "28px",
  },

  photoGateText: {
    color: "#8f9baa",
    fontSize: "13px",
    lineHeight: 1.6,
    margin:
      "10px auto 22px",
    maxWidth: "520px",
  },

  cameraFrame: {
    width: "100%",
    aspectRatio: "4 / 3",
    background: "#080d14",
    border:
      "1px solid #354252",
    borderRadius: "16px",
    overflow: "hidden",
  },

  cameraVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
  },

  cameraImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  photoActions: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  primaryPhotoButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #a97e35, #d7b46a)",
    color: "#161108",
    borderRadius: "9px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 800,
  },

  confirmPhotoButton: {
    border:
      "1px solid #4a5868",
    background: "#18212c",
    color: "#e1e7ed",
    borderRadius: "9px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  uploadPhotoButton: {
    border:
      "1px solid #536171",
    background: "transparent",
    color: "#dce4ed",
    borderRadius: "9px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  photoConsent: {
    marginTop: "16px",
    color: "#6f7b8b",
    fontSize: "11px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background:
      "rgba(0,0,0,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backdropFilter:
      "blur(8px)",
  },

  modal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#111923",
    border:
      "1px solid #344252",
    borderRadius: "18px",
    padding: "25px",
    boxShadow:
      "0 30px 100px rgba(0,0,0,0.55)",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "22px",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border:
      "1px solid #394756",
    background: "#1a2430",
    color: "#b9c2cc",
    cursor: "pointer",
    fontSize: "22px",
    lineHeight: 1,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fieldFullWidth: {
    gridColumn: "1 / -1",
  },

  fieldLabel: {
    color: "#8995a4",
    fontSize: "11px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #354252",
    background: "#0b121a",
    color: "#edf1f5",
    borderRadius: "8px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "13px",
  },

  inputDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  modalActions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
    marginTop: "25px",
  },

  cancelButton: {
    border:
      "1px solid #4b5867",
    background: "#18212c",
    color: "#dce3ea",
    borderRadius: "9px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  saveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #a97e35, #d7b46a)",
    color: "#17120a",
    borderRadius: "9px",
    padding: "11px 20px",
    cursor: "pointer",
    fontWeight: 800,
  },

  loadingCard: {
    width: "min(450px, 90vw)",
    margin: "15vh auto 0",
    padding: "40px",
    textAlign: "center",
    background: "#111923",
    border:
      "1px solid #2c3745",
    borderRadius: "18px",
  },

  loadingIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 18px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #a97e35, #d7b46a)",
    color: "#17120a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    letterSpacing: "1px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "22px",
  },

  loadingText: {
    color: "#8d98a6",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  footer: {
    textAlign: "center",
    color: "#596575",
    fontSize: "10px",
    marginTop: "24px",
    letterSpacing: "0.5px",
  },
};