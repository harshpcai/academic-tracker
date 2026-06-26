export interface Course {
  id: string;
  name: string;
  credits: number;
  percentage: number;
  gpa: number;
  semester: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  lastReviewed: string | null;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface SpacedRepetitionTopic {
  id: string;
  topic: string;
  examDate: string;
  intervals: number[];
  currentIntervalIndex: number;
  lastReviewed: string | null;
  nextReview: string;
  performance: 'again' | 'hard' | 'good' | 'easy' | null;
  createdAt: string;
}

export interface FocusLog {
  id: string;
  day: string;
  studyMinutes: number;
  phoneDistractions: number;
  energyLevel: number;
  weekStart: string;
}

export interface MatrixTask {
  id: string;
  title: string;
  quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  completed: boolean;
  createdAt: string;
}

export interface PomodoroState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
  sessionsCompleted: number;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface AudioConfig {
  activeBinaural: 'alpha' | 'beta' | 'gamma' | null;
  lofiEnabled: boolean;
  rainEnabled: boolean;
  volume: number;
}

export interface FeynmanNote {
  id: string;
  concept: string;
  explanation: string;
  evaluation: string | null;
  score: number | null;
  createdAt: string;
}

export interface AppState {
  courses: Course[];
  flashcardDecks: FlashcardDeck[];
  srTopics: SpacedRepetitionTopic[];
  focusLogs: FocusLog[];
  matrixTasks: MatrixTask[];
  pomodoro: PomodoroState;
  studyStreak: StudyStreak;
  audioConfig: AudioConfig;
  feynmanNotes: FeynmanNote[];
  activeSection: string;
}

export type GradeScale = '4.0' | 'percentage';

export interface BookRecommendation {
  title: string;
  author: string;
  insight: string;
  trigger: string;
  coverGradient: string;
}
