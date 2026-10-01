import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/database";
const router = Router();
/* =========================
   Candidate Photo Upload
========================= */
const photoDir = path.resolve(process.cwd(), "storage", "candidate-photos");
fs.mkdirSync(photoDir, { recursive: true });
const photoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, photoDir);
    },
    filename: (req, _file, cb) => {
        const id = String(req.params.id);
        cb(null, `${id}.jpg`);
    },
});
const photoUpload = multer({
    storage: photoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});
/* =========================
   Get all candidates
========================= */
router.get("/", async (_req, res) => {
    try {
        const result = await pool.query(`
      SELECT *
      FROM candidates
      ORDER BY created_at DESC
    `);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching candidates:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch candidates",
        });
    }
});
/* =========================
   Get candidate by ID
========================= */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT *
      FROM candidates
      WHERE id = $1
      `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error fetching candidate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch candidate",
        });
    }
});
/* =========================
   Upload candidate photo
========================= */
router.post("/:id/photo", photoUpload.single("photo"), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Photo is required",
            });
        }
        const photoUrl = `/uploads/candidate-photos/${req.file.filename}`;
        const result = await pool.query(`
        UPDATE candidates
        SET
          candidate_photo_url = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `, [photoUrl, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found",
            });
        }
        return res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Candidate photo upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload candidate photo",
        });
    }
});
// existing GET routes...
// =========================
// Get candidate Round 1 answers
// =========================
router.get("/:id/round-one", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT
        roa.id,
        roa.question_id,
        roa.answer_text,
        roa.normalized_value,
        roa.answer_mode,
        roa.answered_at,
        roq.question_text
      FROM round_one_answers roa
      JOIN round_one_questions roq
        ON roq.id = roa.question_id
      JOIN interview_rounds ir
        ON ir.id = roa.round_id
      JOIN interviews i
        ON i.id = ir.interview_id
      WHERE i.candidate_id = $1
        AND ir.round_number = 1
      ORDER BY roq.display_order ASC
      `, [id]);
        return res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error("Error fetching candidate Round 1 answers:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load candidate Round 1 answers",
        });
    }
});
// =========================
// Update candidate
// =========================
/* =========================
   Update candidate
========================= */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, age, gender, bloodGroup, phone, email, address, education, experienceYears, previousCompany, candidateLevel, } = req.body;
        const result = await pool.query(`
      UPDATE candidates
      SET
        full_name = $1,
        age = $2,
        gender = $3,
        blood_group = $4,
        phone = $5,
        email = $6,
        address = $7,
        education = $8,
        experience_years = $9,
        previous_company = $10,
        candidate_level = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *
      `, [
            fullName || null,
            age || null,
            gender || null,
            bloodGroup || null,
            phone || null,
            email || null,
            address || null,
            education || null,
            experienceYears ?? null,
            previousCompany || null,
            candidateLevel || null,
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found",
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error updating candidate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update candidate",
        });
    }
});
/* =========================
   Create candidate
========================= */
router.post("/", async (req, res) => {
    try {
        const { candidateCode, fullName, age, gender, bloodGroup, phone, email, address, education, experienceYears, previousCompany, candidateLevel, } = req.body;
        if (!candidateCode || !fullName) {
            return res.status(400).json({
                success: false,
                message: "candidateCode and fullName are required",
            });
        }
        const result = await pool.query(`
      INSERT INTO candidates (
        candidate_code,
        full_name,
        age,
        gender,
        blood_group,
        phone,
        email,
        address,
        education,
        experience_years,
        previous_company,
        candidate_level
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
      `, [
            candidateCode,
            fullName,
            age || null,
            gender || null,
            bloodGroup || null,
            phone || null,
            email || null,
            address || null,
            education || null,
            experienceYears || null,
            previousCompany || null,
            candidateLevel || "workmen",
        ]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating candidate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create candidate",
        });
    }
});
export default router;
//# sourceMappingURL=candidateRoutes.js.map