import { Router } from "express";
import pool from "../config/database";

const router = Router();

// Get all answers for a round
router.get("/round/:roundId", async (req, res) => {
  try {
    const { roundId } = req.params;

    const result = await pool.query(
      `SELECT
         ca.*,
         q.question_text,
         q.reference_answer,
         q.max_marks,
         q.difficulty
       FROM candidate_answers ca
       JOIN questions q ON q.id = ca.question_id
       WHERE ca.round_id = $1
       ORDER BY ca.answered_at ASC`,
      [roundId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching candidate answers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate answers",
    });
  }
});

// Submit candidate answer
router.post("/", async (req, res) => {
  try {
    const {
      roundId,
      questionId,
      answerText,
      transcript,
      answerMode,
    } = req.body;

    if (!roundId || !questionId) {
      return res.status(400).json({
        success: false,
        message: "roundId and questionId are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO candidate_answers (
        round_id,
        question_id,
        answer_text,
        transcript,
        answer_mode
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        roundId,
        questionId,
        answerText || null,
        transcript || null,
        answerMode || "text",
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error submitting candidate answer:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit candidate answer",
    });
  }
});

export default router;