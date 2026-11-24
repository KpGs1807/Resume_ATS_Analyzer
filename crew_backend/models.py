"""
Pydantic schemas that mirror src/types.ts on the frontend.

Each CrewAI Task is given one of these as `output_pydantic`, which forces
the agent's final answer to conform to the schema (CrewAI validates/repairs
the LLM output against it). This is what lets us assemble a JSON response
that the React app can consume directly, instead of parsing free-form text.
"""

from typing import List, Literal
from pydantic import BaseModel, Field


class JdKeywords(BaseModel):
    technicalSkills: List[str] = Field(default_factory=list)
    softSkills: List[str] = Field(default_factory=list)
    toolsAndTechnologies: List[str] = Field(default_factory=list)
    qualifications: List[str] = Field(default_factory=list)
    experienceRequirements: str = ""
    keyResponsibilities: List[str] = Field(default_factory=list)
    otherKeywords: List[str] = Field(default_factory=list)


class ImprovementArea(BaseModel):
    area: str
    suggestion: str


class ResumeAnalysis(BaseModel):
    matchingSkills: List[str] = Field(default_factory=list)
    matchingExperience: List[str] = Field(default_factory=list)
    matchingQualifications: List[str] = Field(default_factory=list)
    missingKeywords: List[str] = Field(default_factory=list)
    missingSkills: List[str] = Field(default_factory=list)
    missingQualifications: List[str] = Field(default_factory=list)
    strengthsSummary: str = ""
    improvementAreas: List[ImprovementArea] = Field(default_factory=list)


class AtsBreakdown(BaseModel):
    keywordMatch: float
    skillsAlignment: float
    experienceRelevance: float
    educationQualifications: float


class AtsScore(BaseModel):
    score: float
    matchPercentage: float
    suitability: Literal["High", "Moderate", "Low"]
    verdict: str
    explanation: str
    breakdown: AtsBreakdown
    topRecommendations: List[str] = Field(default_factory=list)


class InterviewQuestionItem(BaseModel):
    id: str
    category: Literal["Technical", "Scenario-Based", "Behavioral", "Job-Specific"]
    question: str
    suggestedAnswer: str
    whyThisQuestion: str
    candidateTip: str


class InterviewQuestions(BaseModel):
    """Wrapped in an object because CrewAI's output_pydantic needs a single model,
    not a bare list."""
    questions: List[InterviewQuestionItem] = Field(default_factory=list)


class FullAnalysisReport(BaseModel):
    """Final shape returned to the frontend. `id` and `generatedAt` are
    stamped on by the API layer, not by the LLM."""
    id: str
    generatedAt: int
    jobKeywords: JdKeywords
    resumeAnalysis: ResumeAnalysis
    atsScore: AtsScore
    interviewQuestions: List[InterviewQuestionItem]
