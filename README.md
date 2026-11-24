<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Resume & Job Description Analyzer

A React/Vite frontend ("Scanline") backed by a real **CrewAI multi-agent pipeline**:

```
job_description_agent  ->  resume_analysis_agent  ->  resume_ats_score_agent  ->  interview_questions_agent
```

Each agent runs sequentially (CrewAI `Process.sequential`), reads the previous agents'
output as context, and returns a structured Pydantic result. The FastAPI service
assembles those four outputs into the JSON shape the React app renders.

## Architecture

```
Browser  --->  Express/Vite server (server.ts, port 3000)
                    |
                    |  POST /api/analyze  (proxies)
                    v
               FastAPI service (crew_backend/api.py, port 8001)
                    |
                    v
               CrewAI crew (crew_backend/crew.py) -> Gemini
```

`server.ts` no longer calls Gemini itself - it just forwards `/api/analyze`
requests to the Python service, which is the one actually running the agents.

## Run Locally

**Prerequisites:** Node.js 18+, Python 3.10+

### 1. Start the CrewAI backend (FastAPI)

```bash
cd crew_backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env   # then edit .env and set GEMINI_API_KEY
python api.py
```

This starts the FastAPI service on `http://localhost:8001`. Visit
`http://localhost:8001/health` to confirm it's up and has an API key configured.

### 2. Start the frontend/Express server

In a second terminal, from the project root:

```bash
npm install
cp .env.example .env.local   # CREW_API_URL defaults to http://localhost:8001, override if needed
npm run dev
```

Visit `http://localhost:3000`. Uploading a resume + job description now runs the
actual 4-agent CrewAI crew instead of a single simulated Gemini call.

### Optional: run both with one command

`npm run dev:crew` starts just the Python service (`cd crew_backend && python api.py`)
if you'd rather kick it off from the Node project's `package.json` scripts.

## Notes

- The crew's tasks (`configuration/tasks.yaml`) receive the job description and
  resume text directly via CrewAI's `kickoff(inputs=...)` - there's no more
  reliance on fixed local files like `Job_Description.txt`.
- PDF resumes uploaded as base64 are converted to text by the FastAPI layer
  (`crew_backend/api.py`) with `pypdf` before being handed to the crew.
- Each task declares an `output_pydantic` schema (`crew_backend/models.py`) so
  the final API response matches `src/types.ts`'s `FullAnalysisReport` exactly.
