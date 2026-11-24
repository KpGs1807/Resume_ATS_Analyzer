export interface JobDescriptionData {
  text: string;
  source: 'typed' | 'uploaded' | 'sample';
  fileName?: string;
  fileSize?: number;
  wordCount: number;
  lastUpdated: number;
}

export interface ResumeData {
  text?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  base64Data?: string; // For PDF multimodal processing
  source: 'uploaded' | 'pasted' | 'sample';
  uploadedAt: number;
  extractedSnippet?: string;
}

export interface JdKeywords {
  technicalSkills: string[];
  softSkills: string[];
  toolsAndTechnologies: string[];
  qualifications: string[];
  experienceRequirements: string;
  keyResponsibilities: string[];
  otherKeywords: string[];
}

export interface ResumeMatchAnalysis {
  matchingSkills: string[];
  matchingExperience: string[];
  matchingQualifications: string[];
  missingKeywords: string[];
  missingSkills: string[];
  missingQualifications: string[];
  strengthsSummary: string;
  improvementAreas: Array<{
    area: string;
    suggestion: string;
  }>;
}

export interface AtsScoreData {
  score: number; // 0 to 100
  matchPercentage: number; // 0 to 100
  suitability: 'High' | 'Moderate' | 'Low';
  verdict: string;
  explanation: string;
  breakdown: {
    keywordMatch: number; // 0 - 100
    skillsAlignment: number;
    experienceRelevance: number;
    educationQualifications: number;
  };
  topRecommendations: string[];
}

export interface InterviewQuestionItem {
  id: string;
  category: 'Technical' | 'Scenario-Based' | 'Behavioral' | 'Job-Specific';
  question: string;
  suggestedAnswer: string;
  whyThisQuestion: string;
  candidateTip: string;
}

export interface FullAnalysisReport {
  id: string;
  generatedAt: number;
  jobKeywords: JdKeywords;
  resumeAnalysis: ResumeMatchAnalysis;
  atsScore: AtsScoreData;
  interviewQuestions: InterviewQuestionItem[];
}
