import { Router } from "express";
import pool from "../config/database";
const router = Router();
/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE ROUND 1 QUESTIONS
|--------------------------------------------------------------------------
*/
router.get("/questions", async (_req, res) => {
    try {
        const result = await pool.query(`SELECT *
       FROM round_one_questions
       WHERE is_active = TRUE
       ORDER BY display_order ASC`);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching Round 1 questions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Round 1 questions",
        });
    }
});
/*
|--------------------------------------------------------------------------
| GET SINGLE ROUND 1 QUESTION
|--------------------------------------------------------------------------
*/
router.get("/questions/:order", async (req, res) => {
    try {
        const order = Number(req.params.order);
        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid question order",
            });
        }
        const result = await pool.query(`SELECT *
       FROM round_one_questions
       WHERE display_order = $1
       AND is_active = TRUE`, [order]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Round 1 question not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error fetching Round 1 question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Round 1 question",
        });
    }
});
/*
|--------------------------------------------------------------------------
| SAVE / UPDATE ROUND 1 ANSWER
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route NEVER completes Round 1 automatically.
|
| Candidate can answer all questions first.
| Round 1 is completed only after:
|
| Candidate Details Summary
|        ↓
| Edit Details (optional)
|        ↓
| Confirm & Continue
|
|--------------------------------------------------------------------------
*/
router.post("/answers", async (req, res) => {
    console.log("🔥 ROUND ONE ANSWERS ROUTE HIT");
    try {
        const { candidateId, interviewId, roundId, questionId, answerText, normalizedValue, answerMode, } = req.body;
        if (!candidateId || !interviewId || !roundId || !questionId) {
            return res.status(400).json({
                success: false,
                message: "candidateId, interviewId, roundId and questionId are required",
            });
        }
        /*
        |--------------------------------------------------------------------------
        | SAVE / UPDATE ANSWER
        |--------------------------------------------------------------------------
        */
        const result = await pool.query(`INSERT INTO round_one_answers (
        candidate_id,
        interview_id,
        round_id,
        question_id,
        answer_text,
        normalized_value,
        answer_mode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (round_id, question_id)
      DO UPDATE SET
        answer_text = EXCLUDED.answer_text,
        normalized_value = EXCLUDED.normalized_value,
        answer_mode = EXCLUDED.answer_mode,
        answered_at = NOW()
      RETURNING *`, [
            candidateId,
            interviewId,
            roundId,
            questionId,
            answerText || null,
            normalizedValue || null,
            answerMode || "text",
        ]);
        /*
        |--------------------------------------------------------------------------
        | CHECK PROGRESS
        |--------------------------------------------------------------------------
        */
        const completionResult = await pool.query(`SELECT
         (
           SELECT COUNT(*)
           FROM round_one_questions
           WHERE is_active = TRUE
         ) AS total_questions,

         (
           SELECT COUNT(*)
           FROM round_one_answers
           WHERE round_id = $1
         ) AS answered_questions`, [roundId]);
        const totalQuestions = Number(completionResult.rows[0].total_questions);
        const answeredQuestions = Number(completionResult.rows[0].answered_questions);
        console.log(`Round 1 progress: ${answeredQuestions}/${totalQuestions}`);
        /*
        |--------------------------------------------------------------------------
        | DO NOT COMPLETE ROUND HERE
        |--------------------------------------------------------------------------
        */
        res.status(201).json({
            success: true,
            data: result.rows[0],
            // Important:
            // Round 1 becomes completed only after confirmation.
            roundCompleted: false,
            progress: {
                totalQuestions,
                answeredQuestions,
            },
        });
    }
    catch (error) {
        console.error("Error saving Round 1 answer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save Round 1 answer",
        });
    }
});
/*
|--------------------------------------------------------------------------
| GET ALL ROUND 1 ANSWERS
|--------------------------------------------------------------------------
*/
router.get("/answers/:roundId", async (req, res) => {
    try {
        const { roundId } = req.params;
        const result = await pool.query(`SELECT
         roa.*,
         roq.field_key,
         roq.question_text,
         roq.question_text_tamil,
         roq.display_order
       FROM round_one_answers roa
       JOIN round_one_questions roq
         ON roq.id = roa.question_id
       WHERE roa.round_id = $1
       ORDER BY roq.display_order ASC`, [roundId]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching Round 1 answers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Round 1 answers",
        });
    }
});
/*
|--------------------------------------------------------------------------
| CONFIRM ROUND 1
|--------------------------------------------------------------------------
|
| Called only when candidate clicks:
|
|       ✓ Confirm & Continue
|
| Flow:
|
| Round 1 pending
|       ↓
| Candidate confirms details
|       ↓
| Round 1 completed
|       ↓
| Round 2 starts
|
|--------------------------------------------------------------------------
*/
router.post("/confirm", async (req, res) => {
    const client = await pool.connect();
    try {
        const { candidateId, interviewId, roundId, } = req.body;
        if (!candidateId || !interviewId || !roundId) {
            return res.status(400).json({
                success: false,
                message: "candidateId, interviewId and roundId are required",
            });
        }
        await client.query("BEGIN");
        /*
        |--------------------------------------------------------------------------
        | VERIFY ROUND 1 EXISTS
        |--------------------------------------------------------------------------
        */
        const roundResult = await client.query(`SELECT *
       FROM interview_rounds
       WHERE id = $1
       AND interview_id = $2
       AND round_number = 1
       FOR UPDATE`, [roundId, interviewId]);
        if (roundResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Round 1 not found",
            });
        }
        /*
        |--------------------------------------------------------------------------
        | VERIFY REQUIRED QUESTIONS ARE ANSWERED
        |--------------------------------------------------------------------------
        */
        const requiredResult = await client.query(`SELECT
         COUNT(*) AS total_required,

         COUNT(roa.id) AS answered_required

       FROM round_one_questions roq

       LEFT JOIN round_one_answers roa
         ON roa.question_id = roq.id
        AND roa.round_id = $1

       WHERE roq.is_active = TRUE
       AND roq.is_required = TRUE`, [roundId]);
        const totalRequired = Number(requiredResult.rows[0].total_required);
        const answeredRequired = Number(requiredResult.rows[0].answered_required);
        if (answeredRequired < totalRequired) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Please complete all required Round 1 details before confirmation.",
                progress: {
                    totalRequired,
                    answeredRequired,
                },
            });
        }
        /*
        |--------------------------------------------------------------------------
        | COMPLETE ROUND 1
        |--------------------------------------------------------------------------
        */
        await client.query(`UPDATE interview_rounds
       SET
         status = 'completed',
         completed_at = NOW()
       WHERE id = $1`, [roundId]);
        /*
        |--------------------------------------------------------------------------
        | START ROUND 2
        |--------------------------------------------------------------------------
        */
        const roundTwoResult = await client.query(`SELECT id
       FROM interview_rounds
       WHERE interview_id = $1
       AND round_number = 2
       LIMIT 1`, [interviewId]);
        let roundTwoId = null;
        if (roundTwoResult.rows.length > 0) {
            roundTwoId = roundTwoResult.rows[0].id;
            await client.query(`UPDATE interview_rounds
         SET
           status = 'in_progress',
           started_at = COALESCE(started_at, NOW())
         WHERE id = $1`, [roundTwoId]);
        }
        /*
        |--------------------------------------------------------------------------
        | UPDATE INTERVIEW STATUS
        |--------------------------------------------------------------------------
        */
        await client.query(`UPDATE interviews
       SET status = 'in_progress'
       WHERE id = $1`, [interviewId]);
        await client.query("COMMIT");
        console.log(`Round 1 confirmed successfully: ${roundId}`);
        res.json({
            success: true,
            message: "Round 1 confirmed successfully",
            roundCompleted: true,
            nextRound: {
                roundNumber: 2,
                roundId: roundTwoId,
                status: roundTwoId ? "in_progress" : null,
            },
        });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Error confirming Round 1:", error);
        res.status(500).json({
            success: false,
            message: "Failed to confirm Round 1",
        });
    }
    finally {
        client.release();
    }
});
export default router;
//# sourceMappingURL=roundOneRoutes.js.map