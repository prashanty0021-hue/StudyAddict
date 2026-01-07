export enum Subject {
  ECONOMICS = 'Economics',
  OCM = 'Organization of Commerce & Management',
  SP = 'Secretarial Practice',
  BK_ACC = 'Book-Keeping & Accountancy',
  ENGLISH = 'English',
  MARATHI = 'Marathi'
}

export interface UserProfile {
  name: string;
  college: string;
  targetScore: number;
  streak: number;
  completedTests: number;
  questionsSolved: number;
  onboardingComplete: boolean;
  xp: number;
  level: number;
  coins: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint?: string; // New field for resource utilization
}

export interface TopicBreakdown {
  topic: string;
  correct: number;
  total: number;
}

export interface TestResult {
  date: string;
  subject: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number; // in seconds
  xpEarned?: number;
  topicBreakdown?: TopicBreakdown[]; // Detailed breakdown for this specific test
}

export type ViewState = 'ONBOARDING' | 'DASHBOARD' | 'CHAPTER_SELECT' | 'QUIZ_SETUP' | 'QUIZ_ACTIVE' | 'QUIZ_RESULT' | 'ANALYTICS' | 'BATTLE_LOBBY' | 'BATTLE_ACTIVE' | 'BATTLE_RESULT' | 'TEACHER_EXPLAINER' | 'EXAM_HUB' | 'SYLLABUS_READER';

export interface QuizConfig {
  subject: Subject;
  topic?: string; // If undefined, it's a full syllabus test
  title?: string; // Custom title like "March 2024 Past Paper"
  mode: 'PRACTICE' | 'EXAM' | 'BATTLE';
  questionCount: number;
  timeLimit?: number; // in seconds
}

export interface BattleState {
  playerScore: number;
  opponentScore: number;
  currentQuestionIndex: number;
  opponentName: string;
}

export interface LectureSlide {
  title: string;
  content: string[]; // Bullet points
  narration: string; // What the AI says for this slide
  visualCue?: string; // "Chart", "Money", "Factory", "People", "Globe" - helps frontend pick animation
  audioBase64?: string | null; // Cache audio per slide
}

export type LessonType = 'VIDEO' | 'PODCAST';

export interface SavedLesson {
  id: string;
  type: LessonType;
  subject: Subject;
  topic: string;
  language: string;
  dateCreated: string;
  slides: LectureSlide[]; 
}

export interface AIInsight {
  strongTopics: string[];
  weakTopics: string[];
  projectedBoardScore: number;
  timeManagement: 'Too Fast' | 'Good' | 'Too Slow';
  recommendation: string;
}

export interface TextbookChapter {
  title: string;
  sections: {
    heading: string;
    body: string;
  }[];
  keyTerms: string[];
}