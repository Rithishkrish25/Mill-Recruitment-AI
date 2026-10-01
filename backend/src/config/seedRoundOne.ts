import pool from "./database";

const questions = [
  {
    fieldKey: "full_name",
    questionText: "What is your full name?",
    questionTextTamil: "உங்கள் முழு பெயர் என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 1,
  },
  {
    fieldKey: "age",
    questionText: "What is your age?",
    questionTextTamil: "உங்கள் வயது என்ன?",
    inputType: "number",
    isRequired: true,
    displayOrder: 2,
  },
  {
    fieldKey: "gender",
    questionText: "What is your gender?",
    questionTextTamil: "உங்கள் பாலினம் என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 3,
  },
  {
    fieldKey: "blood_group",
    questionText: "What is your blood group?",
    questionTextTamil: "உங்கள் இரத்த வகை என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 4,
  },
  {
    fieldKey: "phone",
    questionText: "What is your phone number?",
    questionTextTamil: "உங்கள் தொலைபேசி எண் என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 5,
  },
  {
    fieldKey: "email",
    questionText: "What is your email address?",
    questionTextTamil: "உங்கள் மின்னஞ்சல் முகவரி என்ன?",
    inputType: "text",
    isRequired: false,
    displayOrder: 6,
  },
  {
    fieldKey: "address",
    questionText: "What is your address?",
    questionTextTamil: "உங்கள் முகவரி என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 7,
  },
  {
    fieldKey: "education",
    questionText: "What is your highest educational qualification?",
    questionTextTamil: "உங்கள் கல்வித் தகுதி என்ன?",
    inputType: "text",
    isRequired: true,
    displayOrder: 8,
  },
  {
    fieldKey: "experience_years",
    questionText: "How many years of work experience do you have?",
    questionTextTamil: "உங்களுக்கு எத்தனை ஆண்டுகள் பணி அனுபவம் உள்ளது?",
    inputType: "number",
    isRequired: true,
    displayOrder: 9,
  },
  {
    fieldKey: "previous_company",
    questionText: "What is the name of your previous company?",
    questionTextTamil: "நீங்கள் முன்பு பணிபுரிந்த நிறுவனத்தின் பெயர் என்ன?",
    inputType: "text",
    isRequired: false,
    displayOrder: 10,
  },
];

async function seedRoundOneQuestions() {
  try {
    await pool.query("DELETE FROM round_one_questions");

    for (const question of questions) {
      await pool.query(
        `INSERT INTO round_one_questions
        (
          field_key,
          question_text,
          question_text_tamil,
          input_type,
          is_required,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          question.fieldKey,
          question.questionText,
          question.questionTextTamil,
          question.inputType,
          question.isRequired,
          question.displayOrder,
        ]
      );
    }

    console.log("Round 1 questions seeded successfully.");
  } catch (error) {
    console.error("Error seeding Round 1 questions:", error);
  } finally {
    await pool.end();
  }
}

seedRoundOneQuestions();