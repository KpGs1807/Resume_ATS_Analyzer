import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Where the real CrewAI multi-agent backend (crew_backend/api.py, FastAPI)
// is listening. Run it separately: `python crew_backend/api.py`.
const CREW_API_URL = process.env.CREW_API_URL || "http://localhost:8001";

// High body limit to allow uploading resumes in base64 / text
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Health check endpoint - reports whether the Python CrewAI service is reachable
app.get("/api/health", async (_req, res) => {
  try {
    const upstream = await fetch(`${CREW_API_URL}/health`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: unknown) {
    res.status(503).json({
      status: "error",
      error: "Could not reach the CrewAI backend.",
      tip: `Make sure it's running (python crew_backend/api.py) and reachable at ${CREW_API_URL}.`,
    });
  }
});


// Comprehensive Resume & Job Description Analysis Endpoint
// This proxies to the real CrewAI multi-agent backend (crew_backend/api.py):
// job_description_agent -> resume_analysis_agent -> resume_ats_score_agent
// -> interview_questions_agent, run sequentially by CrewAI itself.
app.post("/api/analyze", async (req, res) => {
  try {
    const { jobDescriptionText, resumeText, resumeBase64, resumeMimeType } = req.body;

    if (!jobDescriptionText || typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }

    if (!resumeText && !resumeBase64) {
      return res.status(400).json({ error: "Resume content (text or PDF file) is required." });
    }

    const upstream = await fetch(`${CREW_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobDescriptionText,
        resumeText,
        resumeBase64,
        resumeMimeType,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data.detail || data.error || "Analysis failed. Please try again.",
        details: data.detail,
      });
    }

    return res.json(data);
  } catch (error: unknown) {
    console.error("Analysis proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(502).json({
      error: "Could not reach the CrewAI backend.",
      details: errorMessage,
      tip: `Make sure it's running (python crew_backend/api.py) and reachable at ${CREW_API_URL}.`,
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
