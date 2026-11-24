import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from crewai.project import agent, task, crew, CrewBase

from models import JdKeywords, ResumeAnalysis, AtsScore, InterviewQuestions

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure LLM using Gemini via standard CrewAI LLM abstraction
gemini_api_key = os.getenv("GEMINI_API_KEY")
llm = LLM(
    model="gemini-3.1-flash-lite",
    api_key=gemini_api_key,
    temperature=0.3
)


@CrewBase
class Resume_Builder:
    """Multi-Agent Crew for Job Description & Resume Analysis, ATS Scoring, and Interview Prep.

    Unlike the original version, this crew takes the job description and resume
    text directly as kickoff() inputs (job_description_text / resume_text) rather
    than reading fixed files off disk, so it can serve arbitrary uploads from the
    web app. Each task also declares an `output_pydantic` schema so the final
    result can be assembled into the exact JSON shape the React frontend expects.
    """

    agents_config = os.path.join(BASE_DIR, "..", "configuration", "agents.yaml")
    tasks_config = os.path.join(BASE_DIR, "..", "configuration", "tasks.yaml")

    @agent
    def job_description_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["job_description_agent"],
            llm=llm,
            verbose=True,
        )

    @agent
    def resume_analysis_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["resume_analysis_agent"],
            llm=llm,
            verbose=True,
        )

    @agent
    def resume_ats_score_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["resume_ATS_Score_agent"],
            llm=llm,
            verbose=True,
        )

    @agent
    def interview_questions_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["interview_questions_agent"],
            llm=llm,
            verbose=True,
        )

    @task
    def keywords_task(self) -> Task:
        return Task(
            config=self.tasks_config["extract_jd_keywords_task"],
            agent=self.job_description_agent(),
            output_pydantic=JdKeywords,
        )

    @task
    def analyze_task(self) -> Task:
        return Task(
            config=self.tasks_config["analyze_resume_task"],
            agent=self.resume_analysis_agent(),
            context=[self.keywords_task()],
            output_pydantic=ResumeAnalysis,
        )

    @task
    def calculate_ats_score(self) -> Task:
        return Task(
            config=self.tasks_config["calculate_ats_score_task"],
            agent=self.resume_ats_score_agent(),
            context=[self.keywords_task(), self.analyze_task()],
            output_pydantic=AtsScore,
        )

    @task
    def interview_questions(self) -> Task:
        return Task(
            config=self.tasks_config["generate_interview_questions_task"],
            agent=self.interview_questions_agent(),
            context=[self.keywords_task(), self.analyze_task(), self.calculate_ats_score()],
            output_pydantic=InterviewQuestions,
        )

    @crew
    def resume_crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )


def run_analysis(job_description_text: str, resume_text: str):
    """Kicks off the crew with dynamic JD/resume text and returns the CrewOutput.

    Call site (api.py) is responsible for pulling `.pydantic` off each task's
    output and assembling the final FullAnalysisReport.
    """
    crew_instance = Resume_Builder().resume_crew()
    return crew_instance.kickoff(inputs={
        "job_description_text": job_description_text,
        "resume_text": resume_text,
    })


if __name__ == "__main__":
    # Manual CLI test using the sample files shipped in this folder.
    jd_path = os.path.join(BASE_DIR, "Job_Description.txt")
    resume_path = os.path.join(BASE_DIR, "Prajwal_K_P_Resume.txt")
    with open(jd_path, "r", encoding="utf-8") as f:
        jd_text = f.read()
    with open(resume_path, "r", encoding="utf-8") as f:
        resume_text = f.read()

    result = run_analysis(jd_text, resume_text)
    print(result.raw)
