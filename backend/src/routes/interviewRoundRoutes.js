import { Router } from "express";
import pool from "../config/database";
const router = Router();
// Get all rounds for an interview
router.get("/interview/:interviewId", async (req, res) => {
    try {
        const { interviewId } = req.params;
        const result = await pool.query(`SELECT *
       FROM interview_rounds
       WHERE interview_id = $1
       ORDER BY round_number ASC`, [interviewId]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching interview rounds:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview rounds",
        });
    }
});
// Create interview round
router.post("/", async (req, res) => {
    try {
        const { interviewId, roundNumber, roundType, } = req.body;
        if (!interviewId || !roundNumber || !roundType) {
            return res.status(400).json({
                success: false,
                message: "interviewId, roundNumber and roundType are required",
            });
        }
        const result = await pool.query(`INSERT INTO interview_rounds (
        interview_id,
        round_number,
        round_type,
        status
      )
      VALUES ($1, $2, $3, 'pending')
      RETURNING *`, [
            interviewId,
            roundNumber,
            roundType,
        ]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating interview round:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create interview round",
        });
    }
});
// Start an interview round
router.patch("/:id/start", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`UPDATE interview_rounds
       SET status = 'in_progress',
           started_at = NOW()
       WHERE id = $1
       RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview round not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error starting interview round:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start interview round",
        });
    }
});
// Complete an interview round
router.patch("/:id/complete", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`UPDATE interview_rounds
       SET status = 'completed',
           completed_at = NOW()
       WHERE id = $1
       RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview round not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error completing interview round:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete interview round",
        });
    }
});
export default router;
//# sourceMappingURL=interviewRoundRoutes.js.map