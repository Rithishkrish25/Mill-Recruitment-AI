import { Router } from "express";
import pool from "../config/database";
const router = Router();
// Get evaluation for an answer
router.get("/answer/:answerId", async (req, res) => {
    try {
        const { answerId } = req.params;
        const result = await pool.query(`SELECT *
       FROM answer_evaluations
       WHERE answer_id = $1`, [answerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error fetching evaluation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch evaluation",
        });
    }
});
// Create answer evaluation
router.post("/", async (req, res) => {
    try {
        const { answerId, score, maxScore, matchedConcepts, missingConcepts, feedback, evaluatedBy, } = req.body;
        if (!answerId || score === undefined || !maxScore) {
            return res.status(400).json({
                success: false,
                message: "answerId, score and maxScore are required",
            });
        }
        const result = await pool.query(`INSERT INTO answer_evaluations (
        answer_id,
        score,
        max_score,
        matched_concepts,
        missing_concepts,
        feedback,
        evaluated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`, [
            answerId,
            score,
            maxScore,
            matchedConcepts ? JSON.stringify(matchedConcepts) : JSON.stringify([]),
            missingConcepts ? JSON.stringify(missingConcepts) : JSON.stringify([]),
            feedback || null,
            evaluatedBy || "ai",
        ]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating evaluation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create evaluation",
        });
    }
});
export default router;
//# sourceMappingURL=evaluationRoutes.js.map