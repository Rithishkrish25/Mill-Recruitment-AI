import { Router } from "express";
import pool from "../config/database";
const router = Router();
/**
 * GET /api/interviews
 * Admin - list all interviews
 */
router.get("/", async (_req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        i.id,
        i.candidate_id,
        i.job_role_id,
        i.domain_id,
        i.status,
        i.started_at,
        i.completed_at,

        c.candidate_code,
        c.full_name,
        c.education,
        c.experience_years,
        c.candidate_level,

        (
          SELECT COUNT(*)
          FROM interview_rounds ir
          WHERE ir.interview_id = i.id
        )::int AS round_count,

        (
          SELECT COUNT(*)
          FROM interview_rounds ir
          WHERE ir.interview_id = i.id
            AND LOWER(ir.status) IN (
              'completed',
              'complete',
              'finished'
            )
        )::int AS completed_rounds

      FROM interviews i
      INNER JOIN candidates c
        ON c.id = i.candidate_id

      ORDER BY i.started_at DESC NULLS LAST
    `);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("GET /api/interviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch interviews",
        });
    }
});
/**
 * GET /api/interviews/:id
 * Get interview details
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT
        i.id,
        i.candidate_id,
        i.job_role_id,
        i.domain_id,
        i.status,
        i.started_at,
        i.completed_at,

        c.candidate_code,
        c.full_name,
        c.age,
        c.gender,
        c.blood_group,
        c.phone,
        c.email,
        c.address,
        c.education,
        c.experience_years,
        c.previous_company,
        c.candidate_level

      FROM interviews i
      INNER JOIN candidates c
        ON c.id = i.candidate_id

      WHERE i.id = $1
      `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("GET /api/interviews/:id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview",
        });
    }
});
/**
 * GET /api/interviews/:id/rounds
 * Get all rounds for an interview
 */
router.get("/:id/rounds", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT
        ir.id,
        ir.interview_id,
        ir.round_number,
        ir.round_type,
        ir.status,
        ir.started_at,
        ir.completed_at,

        CASE
          WHEN LOWER(ir.round_type) = 'basic information'
            THEN 'Basic Round'

          WHEN LOWER(ir.round_type) = 'technical interview'
            THEN 'Technical Round'

          ELSE ir.round_type
        END AS round_name

      FROM interview_rounds ir

      WHERE ir.interview_id = $1

      ORDER BY ir.round_number ASC
      `, [id]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("GET /api/interviews/:id/rounds error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview rounds",
        });
    }
});
/**
 * GET /api/interviews/:id/summary
 * Admin interview summary
 */
router.get("/:id/summary", async (req, res) => {
    try {
        const { id } = req.params;
        const interviewResult = await pool.query(`
      SELECT
        i.id,
        i.candidate_id,
        i.job_role_id,
        i.domain_id,
        i.status,
        i.started_at,
        i.completed_at,

        c.candidate_code,
        c.full_name,
        c.education,
        c.experience_years,
        c.candidate_level

      FROM interviews i
      INNER JOIN candidates c
        ON c.id = i.candidate_id

      WHERE i.id = $1
      `, [id]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }
        const roundsResult = await pool.query(`
      SELECT
        ir.id,
        ir.interview_id,
        ir.round_number,
        ir.round_type,
        ir.status,
        ir.started_at,
        ir.completed_at,

        CASE
          WHEN LOWER(ir.round_type) = 'basic information'
            THEN 'Basic Round'

          WHEN LOWER(ir.round_type) = 'technical interview'
            THEN 'Technical Round'

          ELSE ir.round_type
        END AS round_name

      FROM interview_rounds ir

      WHERE ir.interview_id = $1

      ORDER BY ir.round_number ASC
      `, [id]);
        res.json({
            success: true,
            data: {
                interview: interviewResult.rows[0],
                rounds: roundsResult.rows,
            },
        });
    }
    catch (error) {
        console.error("GET /api/interviews/:id/summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview summary",
        });
    }
});
/**
 * POST /api/interviews
 * Create a new interview
 *
 * NOTE:
 * Existing interviews are NOT modified.
 */
router.post("/", async (req, res) => {
    const client = await pool.connect();
    try {
        const { candidate_id, job_role_id = null, domain_id = null, } = req.body;
        if (!candidate_id) {
            return res.status(400).json({
                success: false,
                message: "candidate_id is required",
            });
        }
        await client.query("BEGIN");
        const interviewResult = await client.query(`
      INSERT INTO interviews (
        candidate_id,
        job_role_id,
        domain_id,
        status,
        started_at
      )
      VALUES (
        $1,
        $2,
        $3,
        'pending',
        NOW()
      )
      RETURNING
        id,
        candidate_id,
        job_role_id,
        domain_id,
        status,
        started_at,
        completed_at
      `, [candidate_id, job_role_id, domain_id]);
        const interview = interviewResult.rows[0];
        await client.query(`
      INSERT INTO interview_rounds (
        interview_id,
        round_number,
        round_type,
        status
      )
      VALUES
        ($1, 1, 'Basic Information', 'pending'),
        ($1, 2, 'Technical Interview', 'pending')
      `, [interview.id]);
        await client.query("COMMIT");
        res.status(201).json({
            success: true,
            message: "Interview created successfully",
            data: interview,
        });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("POST /api/interviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create interview",
        });
    }
    finally {
        client.release();
    }
});
/**
 * PATCH /api/interviews/:id/status
 * Update interview status
 */
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "status is required",
            });
        }
        const result = await pool.query(`
      UPDATE interviews
      SET
        status = $1,
        completed_at =
          CASE
            WHEN LOWER($1) IN ('completed', 'complete', 'finished')
              THEN NOW()
            ELSE completed_at
          END

      WHERE id = $2

      RETURNING
        id,
        candidate_id,
        job_role_id,
        domain_id,
        status,
        started_at,
        completed_at
      `, [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }
        res.json({
            success: true,
            message: "Interview status updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("PATCH /api/interviews/:id/status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update interview status",
        });
    }
});
/**
 * PATCH /api/interviews/rounds/:roundId/status
 * Update round status
 */
router.patch("/rounds/:roundId/status", async (req, res) => {
    try {
        const { roundId } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "status is required",
            });
        }
        const result = await pool.query(`
        UPDATE interview_rounds
        SET
          status = $1,

          started_at =
            CASE
              WHEN LOWER($1) IN ('in_progress', 'in progress', 'started')
                AND started_at IS NULL
              THEN NOW()
              ELSE started_at
            END,

          completed_at =
            CASE
              WHEN LOWER($1) IN ('completed', 'complete', 'finished')
                THEN NOW()
              ELSE completed_at
            END

        WHERE id = $2

        RETURNING
          id,
          interview_id,
          round_number,
          round_type,
          status,
          started_at,
          completed_at
        `, [status, roundId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Interview round not found",
            });
        }
        res.json({
            success: true,
            message: "Round status updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("PATCH /api/interviews/rounds/:roundId/status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update round status",
        });
    }
});
export default router;
//# sourceMappingURL=interviewRoutes.js.map