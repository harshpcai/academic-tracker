import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  AppState,
  Course,
  FlashcardDeck,
  SpacedRepetitionTopic,
  FocusLog,
  MatrixTask,
  PomodoroState,
  StudyStreak,
  AudioConfig,
  FeynmanNote,
} from '../types';
import { getToday, getWeekStart, generateId } from '../utils/helpers';

const STORAGE_KEY = 'cortex_academic_state';

function getInitialState(): AppState {
  return {
    courses: [],
    flashcardDecks: [],
    srTopics: [],
    focusLogs: [],
    matrixTasks: [],
    pomodoro: {
      minutes: 25,
      seconds: 0,
      isRunning: false,
      isBreak: false,
      sessionsCompleted: 0,
    },
    studyStreak: {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    },
    audioConfig: {
      activeBinaural: null,
      lofiEnabled: false,
      rainEnabled: false,
      volume: 0.5,
    },
    feynmanNotes: [],
    activeSection: 'academics',
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return { ...getInitialState(), ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return getInitialState();
}

export type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'ADD_FLASHCARD_DECK'; payload: FlashcardDeck }
  | { type: 'UPDATE_FLASHCARD_DECK'; payload: FlashcardDeck }
  | { type: 'DELETE_FLASHCARD_DECK'; payload: string }
  | { type: 'ADD_SR_TOPIC'; payload: SpacedRepetitionTopic }
  | { type: 'UPDATE_SR_TOPIC'; payload: SpacedRepetitionTopic }
  | { type: 'DELETE_SR_TOPIC'; payload: string }
  | { type: 'ADD_FOCUS_LOG'; payload: FocusLog }
  | { type: 'UPDATE_FOCUS_LOG'; payload: FocusLog }
  | { type: 'DELETE_FOCUS_LOG'; payload: string }
  | { type: 'ADD_MATRIX_TASK'; payload: MatrixTask }
  | { type: 'UPDATE_MATRIX_TASK'; payload: MatrixTask }
  | { type: 'DELETE_MATRIX_TASK'; payload: string }
  | { type: 'SET_POMODORO'; payload: PomodoroState }
  | { type: 'UPDATE_STUDY_STREAK'; payload: StudyStreak }
  | { type: 'SET_AUDIO_CONFIG'; payload: AudioConfig }
  | { type: 'ADD_FEYNMAN_NOTE'; payload: FeynmanNote }
  | { type: 'UPDATE_FEYNMAN_NOTE'; payload: FeynmanNote }
  | { type: 'DELETE_FEYNMAN_NOTE'; payload: string }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'HYDRATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE': {
      const updatedCourses = state.courses.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      return { ...state, courses: updatedCourses };
    }
    case 'DELETE_COURSE':
      return { ...state, courses: state.courses.filter(c => c.id !== action.payload) };
    case 'ADD_FLASHCARD_DECK':
      return { ...state, flashcardDecks: [...state.flashcardDecks, action.payload] };
    case 'UPDATE_FLASHCARD_DECK': {
      const updatedDecks = state.flashcardDecks.map(d =>
        d.id === action.payload.id ? action.payload : d
      );
      return { ...state, flashcardDecks: updatedDecks };
    }
    case 'DELETE_FLASHCARD_DECK':
      return { ...state, flashcardDecks: state.flashcardDecks.filter(d => d.id !== action.payload) };
    case 'ADD_SR_TOPIC':
      return { ...state, srTopics: [...state.srTopics, action.payload] };
    case 'UPDATE_SR_TOPIC': {
      const updatedTopics = state.srTopics.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      return { ...state, srTopics: updatedTopics };
    }
    case 'DELETE_SR_TOPIC':
      return { ...state, srTopics: state.srTopics.filter(t => t.id !== action.payload) };
    case 'ADD_FOCUS_LOG':
      return { ...state, focusLogs: [...state.focusLogs, action.payload] };
    case 'UPDATE_FOCUS_LOG': {
      const updatedLogs = state.focusLogs.map(l =>
        l.id === action.payload.id ? action.payload : l
      );
      return { ...state, focusLogs: updatedLogs };
    }
    case 'DELETE_FOCUS_LOG':
      return { ...state, focusLogs: state.focusLogs.filter(l => l.id !== action.payload) };
    case 'ADD_MATRIX_TASK':
      return { ...state, matrixTasks: [...state.matrixTasks, action.payload] };
    case 'UPDATE_MATRIX_TASK': {
      const updatedTasks = state.matrixTasks.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      return { ...state, matrixTasks: updatedTasks };
    }
    case 'DELETE_MATRIX_TASK':
      return { ...state, matrixTasks: state.matrixTasks.filter(t => t.id !== action.payload) };
    case 'SET_POMODORO':
      return { ...state, pomodoro: action.payload };
    case 'UPDATE_STUDY_STREAK':
      return { ...state, studyStreak: action.payload };
    case 'SET_AUDIO_CONFIG':
      return { ...state, audioConfig: action.payload };
    case 'ADD_FEYNMAN_NOTE':
      return { ...state, feynmanNotes: [...state.feynmanNotes, action.payload] };
    case 'UPDATE_FEYNMAN_NOTE': {
      const updatedNotes = state.feynmanNotes.map(n =>
        n.id === action.payload.id ? action.payload : n
      );
      return { ...state, feynmanNotes: updatedNotes };
    }
    case 'DELETE_FEYNMAN_NOTE':
      return { ...state, feynmanNotes: state.feynmanNotes.filter(n => n.id !== action.payload) };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

interface AcademicContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState(), loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const checkStudyStreak = useCallback(() => {
    const today = getToday();
    const tasksCompletedToday = state.matrixTasks.filter(
      t => t.completed && t.createdAt.startsWith(today)
    ).length;

    if (tasksCompletedToday > 0 && state.studyStreak.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = state.studyStreak.currentStreak;
      if (state.studyStreak.lastStudyDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      dispatch({
        type: 'UPDATE_STUDY_STREAK',
        payload: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.studyStreak.longestStreak),
          lastStudyDate: today,
        },
      });
    }
  }, [state.matrixTasks, state.studyStreak, dispatch]);

  useEffect(() => {
    checkStudyStreak();
  }, [checkStudyStreak]);

  return (
    <AcademicContext.Provider value={{ state, dispatch }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic(): AcademicContextType {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}

export function useCourses() {
  const { state, dispatch } = useAcademic();
  return {
    courses: state.courses,
    addCourse: (course: Omit<Course, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_COURSE',
        payload: { ...course, id: generateId(), createdAt: new Date().toISOString() },
      }),
    updateCourse: (course: Course) => dispatch({ type: 'UPDATE_COURSE', payload: course }),
    deleteCourse: (id: string) => dispatch({ type: 'DELETE_COURSE', payload: id }),
  };
}

export function useFlashcardDecks() {
  const { state, dispatch } = useAcademic();
  return {
    decks: state.flashcardDecks,
    addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_FLASHCARD_DECK',
        payload: { ...deck, id: generateId(), createdAt: new Date().toISOString() },
      }),
    updateDeck: (deck: FlashcardDeck) => dispatch({ type: 'UPDATE_FLASHCARD_DECK', payload: deck }),
    deleteDeck: (id: string) => dispatch({ type: 'DELETE_FLASHCARD_DECK', payload: id }),
  };
}

export function useSRTopics() {
  const { state, dispatch } = useAcademic();
  return {
    topics: state.srTopics,
    addTopic: (topic: Omit<SpacedRepetitionTopic, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_SR_TOPIC',
        payload: { ...topic, id: generateId(), createdAt: new Date().toISOString() },
      }),
    updateTopic: (topic: SpacedRepetitionTopic) => dispatch({ type: 'UPDATE_SR_TOPIC', payload: topic }),
    deleteTopic: (id: string) => dispatch({ type: 'DELETE_SR_TOPIC', payload: id }),
  };
}

export function useFocusLogs() {
  const { state, dispatch } = useAcademic();
  return {
    logs: state.focusLogs,
    addLog: (log: Omit<FocusLog, 'id' | 'weekStart'>) =>
      dispatch({
        type: 'ADD_FOCUS_LOG',
        payload: { ...log, id: generateId(), weekStart: getWeekStart(log.day) },
      }),
    updateLog: (log: FocusLog) => dispatch({ type: 'UPDATE_FOCUS_LOG', payload: log }),
    deleteLog: (id: string) => dispatch({ type: 'DELETE_FOCUS_LOG', payload: id }),
  };
}

export function useMatrixTasks() {
  const { state, dispatch } = useAcademic();
  return {
    tasks: state.matrixTasks,
    addTask: (task: Omit<MatrixTask, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_MATRIX_TASK',
        payload: { ...task, id: generateId(), createdAt: new Date().toISOString() },
      }),
    updateTask: (task: MatrixTask) => dispatch({ type: 'UPDATE_MATRIX_TASK', payload: task }),
    deleteTask: (id: string) => dispatch({ type: 'DELETE_MATRIX_TASK', payload: id }),
  };
}

export function usePomodoro() {
  const { state, dispatch } = useAcademic();
  return {
    pomodoro: state.pomodoro,
    setPomodoro: (p: PomodoroState | ((prev: PomodoroState) => PomodoroState)) => {
      const next = typeof p === 'function' ? p(state.pomodoro) : p;
      dispatch({ type: 'SET_POMODORO', payload: next });
    },
  };
}

export function useStudyStreak() {
  const { state } = useAcademic();
  return state.studyStreak;
}

export function useAudioConfig() {
  const { state, dispatch } = useAcademic();
  return {
    config: state.audioConfig,
    setConfig: (config: AudioConfig) => dispatch({ type: 'SET_AUDIO_CONFIG', payload: config }),
  };
}

export function useFeynmanNotes() {
  const { state, dispatch } = useAcademic();
  return {
    notes: state.feynmanNotes,
    addNote: (note: Omit<FeynmanNote, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_FEYNMAN_NOTE',
        payload: { ...note, id: generateId(), createdAt: new Date().toISOString() },
      }),
    updateNote: (note: FeynmanNote) => dispatch({ type: 'UPDATE_FEYNMAN_NOTE', payload: note }),
    deleteNote: (id: string) => dispatch({ type: 'DELETE_FEYNMAN_NOTE', payload: id }),
  };
}

export function useActiveSection() {
  const { state, dispatch } = useAcademic();
  return {
    activeSection: state.activeSection,
    setActiveSection: (section: string) => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }),
  };
}
