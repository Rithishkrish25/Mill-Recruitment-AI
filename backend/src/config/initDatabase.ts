import pool from "./database";

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log("Starting database initialization...");

    await client.query("BEGIN");

    // Enable UUID generation
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);


    // ---------------------------------------------------------
    // CORE TABLES
    // ---------------------------------------------------------

    await client.query(`
      CREATE TABLE IF NOT EXISTS job_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
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
    `);

    await client.query(`
      ALTER TABLE candidates
      ADD COLUMN IF NOT EXISTS candidate_photo_url TEXT;
    `);

    await client.query(`
      ALTER TABLE candidates
      ADD COLUMN IF NOT EXISTS candidate_level VARCHAR(20);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES candidates(id),
        job_role_id UUID REFERENCES job_roles(id),
        domain_id UUID REFERENCES domains(id),
        status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_rounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        round_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        UNIQUE (interview_id, round_number)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_id UUID NOT NULL REFERENCES domains(id),
        question_text TEXT NOT NULL,
        reference_answer TEXT,
        max_marks NUMERIC(5,2) NOT NULL DEFAULT 10,
        difficulty VARCHAR(30),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS candidate_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES questions(id),
        answer_text TEXT,
        transcript TEXT,
        answer_mode VARCHAR(20) NOT NULL DEFAULT 'text',
        answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS answer_evaluations (
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
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ---------------------------------------------------------
    // ROUND 1 QUESTIONS
    // ---------------------------------------------------------

    await client.query(`
      CREATE TABLE IF NOT EXISTS round_one_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        field_key VARCHAR(100) NOT NULL UNIQUE,
        question_text TEXT NOT NULL,
        question_text_tamil TEXT,
        input_type VARCHAR(30) NOT NULL DEFAULT 'text',
        is_required BOOLEAN NOT NULL DEFAULT TRUE,
        display_order INTEGER NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ---------------------------------------------------------
    // ROUND 1 ANSWERS
    // ---------------------------------------------------------

    await client.query(`
      CREATE TABLE IF NOT EXISTS round_one_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
        interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
        round_id UUID NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES round_one_questions(id) ON DELETE CASCADE,
        answer_text TEXT,
        normalized_value TEXT,
        answer_mode VARCHAR(20) NOT NULL DEFAULT 'text',
        answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (round_id, question_id)
      );
    `);

    // ---------------------------------------------------------
    // ROUND 1 QUESTIONS SEED
    // ---------------------------------------------------------

    const questions = [
      [
        "full_name",
        "What is your full name?",
        "உங்கள் முழு பெயர் என்ன?",
        "text",
        true,
        1,
      ],
      [
        "age",
        "What is your age?",
        "உங்கள் வயது என்ன?",
        "number",
        true,
        2,
      ],
      [
        "gender",
        "What is your gender?",
        "உங்கள் பாலினம் என்ன?",
        "text",
        true,
        3,
      ],
      [
        "blood_group",
        "What is your blood group?",
        "உங்கள் இரத்த வகை என்ன?",
        "text",
        true,
        4,
      ],
      [
        "phone",
        "What is your phone number?",
        "உங்கள் தொலைபேசி எண் என்ன?",
        "text",
        true,
        5,
      ],
      [
        "email",
        "What is your email address?",
        "உங்கள் மின்னஞ்சல் முகவரி என்ன?",
        "text",
        false,
        6,
      ],
      [
        "address",
        "What is your address?",
        "உங்கள் முகவரி என்ன?",
        "text",
        true,
        7,
      ],
      [
        "education",
        "What is your highest educational qualification?",
        "உங்கள் கல்வித் தகுதி என்ன?",
        "text",
        true,
        8,
      ],
      [
        "experience_years",
        "How many years of work experience do you have?",
        "உங்களுக்கு எத்தனை ஆண்டுகள் பணி அனுபவம் உள்ளது?",
        "number",
        true,
        9,
      ],
      [
        "previous_company",
        "What is the name of your previous company?",
        "நீங்கள் முன்பு பணிபுரிந்த நிறுவனத்தின் பெயர் என்ன?",
        "text",
        false,
        10,
      ],
    ];

    for (const question of questions) {
      await client.query(
        `
        INSERT INTO round_one_questions
        (
          field_key,
          question_text,
          question_text_tamil,
          input_type,
          is_required,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (field_key)
        DO UPDATE SET
          question_text = EXCLUDED.question_text,
          question_text_tamil = EXCLUDED.question_text_tamil,
          input_type = EXCLUDED.input_type,
          is_required = EXCLUDED.is_required,
          display_order = EXCLUDED.display_order,
          is_active = TRUE;
        `,
        question
      );
    }

    await client.query("COMMIT");

    console.log("======================================");
    console.log("Database initialization successful.");
    console.log("Core tables created.");
    console.log("Round 1 tables created.");
    console.log("Round 1 questions seeded.");
    console.log("======================================");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Database initialization failed:", error);

    throw error;
  } finally {
    client.release();
  }
}

initDatabase()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });