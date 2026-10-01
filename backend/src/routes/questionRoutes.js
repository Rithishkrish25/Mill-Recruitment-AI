import { Router } from "express";
import pool from "../config/database";
const router = Router();
// Get questions
router.get("/", async (req, res) => {
    try {
        const { domainId, questionType } = req.query;
        let query = `
      SELECT *
      FROM questions
      WHERE is_active = TRUE
    `;
        const values = [];
        if (domainId) {
            values.push(String(domainId));
            query += ` AND domain_id = $${values.length}`;
        }
        if (questionType) {
            values.push(String(questionType));
            query += ` AND question_type = $${values.length}`;
        }
        query += ` ORDER BY created_at DESC`;
        const result = await pool.query(query, values);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
        });
    }
});
// Create a question
router.post("/", async (req, res) => {
    try {
        const { domainId, questionText, referenceAnswer, maxMarks, difficulty, questionType, } = req.body;
        if (!questionText || !questionType) {
            return res.status(400).json({
                success: false,
                message: "questionText and questionType are required",
            });
        }
        if (!["BASIC", "DOMAIN"].includes(questionType)) {
            return res.status(400).json({
                success: false,
                message: "questionType must be BASIC or DOMAIN",
            });
        }
        if (questionType === "DOMAIN" && !domainId) {
            return res.status(400).json({
                success: false,
                message: "domainId is required for DOMAIN questions",
            });
        }
        const result = await pool.query(`INSERT INTO questions
       (
         domain_id,
         question_text,
         reference_answer,
         max_marks,
         difficulty,
         question_type
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            domainId || null,
            questionText,
            referenceAnswer || null,
            maxMarks || 10,
            difficulty || null,
            questionType,
        ]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create question",
        });
    }
});
// Update a question
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { domainId, questionText, referenceAnswer, maxMarks, difficulty, questionType, } = req.body;
        if (!questionText || !questionType) {
            return res.status(400).json({
                success: false,
                message: "questionText and questionType are required",
            });
        }
        if (!["BASIC", "DOMAIN"].includes(questionType)) {
            return res.status(400).json({
                success: false,
                message: "questionType must be BASIC or DOMAIN",
            });
        }
        if (questionType === "DOMAIN" && !domainId) {
            return res.status(400).json({
                success: false,
                message: "domainId is required for DOMAIN questions",
            });
        }
        const result = await pool.query(`UPDATE questions
       SET
         domain_id = $1,
         question_text = $2,
         reference_answer = $3,
         max_marks = $4,
         difficulty = $5,
         question_type = $6
       WHERE id = $7
       RETURNING *`, [
            domainId || null,
            questionText,
            referenceAnswer || null,
            maxMarks || 10,
            difficulty || null,
            questionType,
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update question",
        });
    }
});
// Activate / deactivate question
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false",
            });
        }
        const result = await pool.query(`UPDATE questions
       SET is_active = $1
       WHERE id = $2
       RETURNING *`, [isActive, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error updating question status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update question status",
        });
    }
});
export default router;
//# sourceMappingURL=questionRoutes.js.map