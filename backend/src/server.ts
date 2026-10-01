import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import pool from "./config/database";

import jobRoleRoutes from "./routes/jobRoleRoutes";
import domainRoutes from "./routes/domainRoutes";
import questionRoutes from "./routes/questionRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import interviewRoundRoutes from "./routes/interviewRoundRoutes";
import candidateAnswerRoutes from "./routes/candidateAnswerRoutes";
import evaluationRoutes from "./routes/evaluationRoutes";
import roundOneRoutes from "./routes/roundOneRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();

const app = express();
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "storage"))
);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/job-roles", jobRoleRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/interview-rounds", interviewRoundRoutes);
app.use("/api/candidate-answers", candidateAnswerRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/round-one", roundOneRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health Check
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      message: "Mill Recruitment AI API is running",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});