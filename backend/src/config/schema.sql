CREATE TABLE job_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    age INTEGER,
    gender VARCHAR(30),
    blood_group VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    education TEXT,
    experience_years NUMERIC(5,2),
    previous_company VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_role_id UUID REFERENCES job_roles(id),
    domain_id UUID REFERENCES domains(id),
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE interview_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    round_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE (interview_id, round_number)
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id),
    question_text TEXT NOT NULL,
    reference_answer TEXT,
    max_marks NUMERIC(5,2) NOT NULL DEFAULT 10,
    difficulty VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    answer_text TEXT,
    transcript TEXT,
    answer_mode VARCHAR(20) NOT NULL DEFAULT 'text',
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE answer_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL UNIQUE REFERENCES candidate_answers(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL,
    matched_concepts JSONB,
    missing_concepts JSONB,
    feedback TEXT,
    evaluated_by VARCHAR(30) NOT NULL DEFAULT 'ai',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);