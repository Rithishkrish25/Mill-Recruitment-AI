import { Router } from "express";
import pool from "../config/database";
const router = Router();
router.get("/", async (_req, res) => {
    try {
        const result = await pool.query("SELECT * FROM job_roles ORDER BY created_at DESC");
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching job roles:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch job roles",
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Job role name is required",
            });
        }
        const result = await pool.query(`INSERT INTO job_roles (name, description)
       VALUES ($1, $2)
       RETURNING *`, [name, description || null]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating job role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create job role",
        });
    }
});
export default router;
//# sourceMappingURL=jobRoleRoutes.js.map