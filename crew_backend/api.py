import base64
import io
import os
import time
from typing import Optional

import pypdf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from crew import Resume_Builder
from models import FullAnalysisReport

load_dotenv()

app = FastAPI(title="Resume/JD Analyzer - CrewAI backend")

# server.ts proxies to this service; CORS is permissive here since the
# real boundary is enforced by the Node server the browser actually talks to.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    jobDescriptionText: str
    resumeText: Optional[str] = None
    resumeBase64: Optional[str] = None
    resumeMimeType: Optional[str] = None


def extract_text_from_pdf_base64(b64_data: str) -> str:
    try:
        raw = base64.b64decode(b64_data)
        reader = pypdf.PdfReader(io.BytesIO(raw))
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        if not text.strip():
            raise ValueError("The PDF appears to have no extractable text.")
        return text
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF resume: {exc}")


@app.get("/health")
def health():
    return {"status": "ok", "hasApiKey": bool(os.getenv("GEMINI_API_KEY"))}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    if not payload.jobDescriptionText or not payload.jobDescriptionText.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    resume_text = payload.resumeText
    if not resume_text and payload.resumeBase64:
        mime = payload.resumeMimeType or "application/pdf"
        if "pdf" in mime:
            resume_text = extract_text_from_pdf_base64(payload.resumeBase64)
        else:
            # Best-effort: treat as UTF-8 plain text.
            resume_text = base64.b64decode(payload.resumeBase64).decode("utf-8", errors="ignore")

    if not resume_text or not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content (text or PDF file) is required.")

    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is missing. Set it in crew_backend/.env",
        )

    try:
        crew_instance = Resume_Builder().resume_crew()
        result = crew_instance.kickoff(inputs={
            "job_description_text": payload.jobDescriptionText[:15000],
            "resume_text": resume_text[:20000],
        })
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Crew execution failed: {exc}")

    tasks_output = result.tasks_output
    if len(tasks_output) < 4:
        raise HTTPException(status_code=500, detail="Crew did not return all expected task outputs.")

    job_keywords = tasks_output[0].pydantic
    resume_analysis = tasks_output[1].pydantic
    ats_score = tasks_output[2].pydantic
    interview_questions = tasks_output[3].pydantic

    if not all([job_keywords, resume_analysis, ats_score, interview_questions]):
        raise HTTPException(
            status_code=500,
            detail="One or more agents did not return structured output. Try again.",
        )

    report = FullAnalysisReport(
        id=f"rep_{int(time.time() * 1000)}",
        generatedAt=int(time.time() * 1000),
        jobKeywords=job_keywords,
        resumeAnalysis=resume_analysis,
        atsScore=ats_score,
        interviewQuestions=interview_questions.questions,
    )

    return {"success": True, "report": report.model_dump()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("CREW_API_PORT", "8001")))
