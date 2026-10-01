import { Router } from "express";
import pool from "../config/database";
const router = Router();
// Get all active domains
router.get("/", async (_req, res) => {
    try {
        const result = await pool.query(`SELECT *
       FROM domains
       WHERE is_active = TRUE
       ORDER BY created_at DESC`);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching domains:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch domains",
        });
    }
});
// Create a new domain
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Domain name is required",
            });
        }
        const result = await pool.query(`INSERT INTO domains (name, description)
       VALUES ($1, $2)
       RETURNING *`, [name, description || null]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating domain:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create domain",
        });
    }
});
export default router;
//# sourceMappingURL=domainRoutes.js.map