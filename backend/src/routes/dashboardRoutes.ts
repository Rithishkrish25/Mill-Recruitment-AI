import { Router } from "express";
import pool from "../config/database";

const router = Router();

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

router.get("/stats", async (_req, res) => {
  try {
    const [
      candidatesResult,
      interviewsResult,
      questionsResult,
      domainsResult,
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM candidates
      `),

      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM interviews
      `),

      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM questions
        WHERE is_active = TRUE
      `),

      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM domains
        WHERE is_active = TRUE
      `),
    ]);

    res.json({
      success: true,
      data: {
        totalCandidates: candidatesResult.rows[0].count,
        totalInterviews: interviewsResult.rows[0].count,
        activeQuestions: questionsResult.rows[0].count,
        activeDomains: domainsResult.rows[0].count,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
});

export default router;