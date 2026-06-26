import type { Course, FocusLog, SpacedRepetitionTopic, Flashcard } from '../types';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function isToday(date: string): boolean {
  return date === getToday();
}

export function isPast(date: string): boolean {
  return new Date(date) < new Date(getToday());
}

export function calculateGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => sum + c.gpa * c.credits, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

export function calculatePercentageAverage(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const total = courses.reduce((sum, c) => sum + c.percentage * c.credits, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  return totalCredits > 0 ? Math.round(total / totalCredits) : 0;
}

export function getGPAColor(gpa: number): string {
  if (gpa >= 3.7) return '#10b981';
  if (gpa >= 3.0) return '#14b8a6';
  if (gpa >= 2.5) return '#f59e0b';
  if (gpa >= 2.0) return '#f97316';
  return '#f43f5e';
}

export function getGPALabel(gpa: number): string {
  if (gpa >= 3.7) return 'Excellent';
  if (gpa >= 3.0) return 'Good';
  if (gpa >= 2.5) return 'Average';
  if (gpa >= 2.0) return 'Below Average';
  return 'At Risk';
}

export function getExamRiskScore(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const avgPercentage = calculatePercentageAverage(courses);
  const lowGradeCount = courses.filter(c => c.percentage < 70).length;
  const riskFactor = (100 - avgPercentage) * 0.6 + (lowGradeCount / courses.length) * 40;
  return Math.min(100, Math.round(riskFactor));
}

export function getRiskColor(score: number): string {
  if (score < 25) return '#10b981';
  if (score < 50) return '#14b8a6';
  if (score < 75) return '#f59e0b';
  return '#f43f5e';
}

export function getRiskLabel(score: number): string {
  if (score < 25) return 'Low Risk';
  if (score < 50) return 'Moderate';
  if (score < 75) return 'Elevated';
  return 'Critical';
}

export function getTotalCredits(courses: Course[]): number {
  return courses.reduce((sum, c) => sum + c.credits, 0);
}

export function getPendingDeadlines(topics: SpacedRepetitionTopic[]): number {
  const today = getToday();
  return topics.filter(t => t.nextReview <= today).length;
}

export function getUpcomingExams(topics: SpacedRepetitionTopic[]): number {
  const today = getToday();
  const twoWeeks = addDays(today, 14);
  return topics.filter(t => t.examDate >= today && t.examDate <= twoWeeks).length;
}

export function calculateFocusDensity(log: FocusLog): number {
  if (log.studyMinutes === 0) return 0;
  const distractionPenalty = Math.min(log.phoneDistractions * 2, 40);
  const energyBoost = log.energyLevel * 8;
  return Math.max(0, Math.min(100, Math.round((log.studyMinutes / 120) * 60 - distractionPenalty + energyBoost)));
}

export function calculateFocusEfficiency(log: FocusLog): number {
  if (log.studyMinutes === 0) return 0;
  const baseEfficiency = Math.min(100, (log.studyMinutes / 180) * 100);
  const distractionDecay = Math.min(50, log.phoneDistractions * 3);
  const energyMultiplier = log.energyLevel / 3;
  return Math.max(0, Math.min(100, Math.round((baseEfficiency - distractionDecay) * energyMultiplier)));
}

export function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getCurrentWeekLogs(logs: FocusLog[]): FocusLog[] {
  const currentWeek = getWeekStart(getToday());
  return logs.filter(l => l.weekStart === currentWeek);
}

export function getDayName(dayIndex: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayIndex];
}

export function calculateDeckMastery(deck: { cards: Flashcard[] }): number {
  if (deck.cards.length === 0) return 0;
  const mastered = deck.cards.filter(c => c.status === 'mastered').length;
  return Math.round((mastered / deck.cards.length) * 100);
}

export function calculateERI(
  daysRemaining: number,
  flashcardMastery: number,
  mockScore: number
): number {
  const timeWeight = Math.min(1, 14 / Math.max(1, daysRemaining)) * 30;
  const masteryWeight = (flashcardMastery / 100) * 40;
  const mockWeight = (mockScore / 100) * 30;
  return Math.min(100, Math.round(timeWeight + masteryWeight + mockWeight));
}

export function evaluateFeynmanText(text: string): { score: number; feedback: string } {
  const wordCount = text.trim().split(/\s+/).length;
  const vagueWords = ['something', 'stuff', 'thing', 'maybe', 'probably', 'kind of', 'sort of', 'etc', 'whatever'];
  const vagueCount = vagueWords.reduce((count, word) => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  let score = 100;
  let feedback = '';

  if (wordCount < 30) {
    score -= 30;
    feedback += 'Your explanation is quite brief. Try expanding with more detail and examples. ';
  } else if (wordCount > 200) {
    score -= 10;
    feedback += 'Your explanation is comprehensive, but ensure it remains simple enough for a child. ';
  }

  if (vagueCount > 2) {
    score -= vagueCount * 8;
    feedback += `Found ${vagueCount} vague terms. Replace words like "something" or "stuff" with specific examples. `;
  }

  const complexWords = ['utilize', 'implement', 'facilitate', 'paradigm', 'synergy', 'leverage', 'optimize'];
  const complexCount = complexWords.reduce((count, word) => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  if (complexCount > 0) {
    score -= complexCount * 5;
    feedback += `Found ${complexCount} complex words. Simplify your language as if explaining to a 10-year-old. `;
  }

  if (score >= 90) {
    feedback = 'Excellent! Your explanation is clear, specific, and accessible. You truly understand this concept.';
  } else if (score >= 70) {
    feedback = feedback || 'Good effort! Your explanation is on the right track. Focus on simplifying complex terms.';
  } else {
    feedback = feedback || 'Keep practicing! Break the concept into smaller pieces and use everyday examples.';
  }

  return { score: Math.max(0, score), feedback };
}

export function getBookRecommendations(
  focusLogs: FocusLog[],
  srTopics: SpacedRepetitionTopic[]
): { title: string; author: string; insight: string; trigger: string; coverGradient: string }[] {
  const currentWeekLogs = getCurrentWeekLogs(focusLogs);
  const totalDistractions = currentWeekLogs.reduce((sum, l) => sum + l.phoneDistractions, 0);
  const totalStudyMinutes = currentWeekLogs.reduce((sum, l) => sum + l.studyMinutes, 0);
  const avgEnergy = currentWeekLogs.length > 0
    ? currentWeekLogs.reduce((sum, l) => sum + l.energyLevel, 0) / currentWeekLogs.length
    : 0;
  const upcomingExams = getUpcomingExams(srTopics);

  const recommendations: { title: string; author: string; insight: string; trigger: string; coverGradient: string }[] = [];

  if (totalDistractions > 15) {
    recommendations.push({
      title: 'Atomic Habits',
      author: 'James Clear',
      insight: 'Your habits and workspace architecture need optimization. Fix workspace triggers.',
      trigger: `Distraction count: ${totalDistractions} this week`,
      coverGradient: 'from-amber-500 to-orange-600',
    });
  }

  if (totalStudyMinutes < 120 && avgEnergy >= 3) {
    recommendations.push({
      title: 'Deep Work',
      author: 'Cal Newport',
      insight: 'You have energy but lack a strict hyper-focused environment. Minimize context switching.',
      trigger: `Study time: ${totalStudyMinutes} mins, Energy: ${avgEnergy.toFixed(1)}/5`,
      coverGradient: 'from-primary to-indigo-700',
    });
  }

  if (avgEnergy <= 2 && currentWeekLogs.length > 0) {
    recommendations.push({
      title: 'Why We Sleep',
      author: 'Dr. Matthew Walker',
      insight: 'Cognitive exhaustion detected. Prioritize sleep cycles to restore memory synapses.',
      trigger: `Average energy: ${avgEnergy.toFixed(1)}/5`,
      coverGradient: 'from-teal-500 to-cyan-600',
    });
  }

  if (upcomingExams > 2) {
    recommendations.push({
      title: 'Make It Stick',
      author: 'Peter Brown',
      insight: 'Switch from reading to active recall immediately. Prioritize active retrieval.',
      trigger: `${upcomingExams} upcoming exams`,
      coverGradient: 'from-emerald-500 to-green-600',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Atomic Habits',
      author: 'James Clear',
      insight: 'Build better systems to sustain your academic momentum.',
      trigger: 'General recommendation',
      coverGradient: 'from-amber-500 to-orange-600',
    });
  }

  return recommendations;
}

export function getLeitnerIntervals(): number[] {
  return [1, 3, 7, 14];
}

export function calculateNextReview(
  topic: SpacedRepetitionTopic,
  performance: 'again' | 'hard' | 'good' | 'easy'
): string {
  const intervals = getLeitnerIntervals();
  let newIndex = topic.currentIntervalIndex;

  switch (performance) {
    case 'again':
      newIndex = 0;
      break;
    case 'hard':
      newIndex = Math.max(0, newIndex - 1);
      break;
    case 'good':
      newIndex = Math.min(intervals.length - 1, newIndex + 1);
      break;
    case 'easy':
      newIndex = Math.min(intervals.length - 1, newIndex + 2);
      break;
  }

  const days = intervals[Math.min(newIndex, intervals.length - 1)];
  return addDays(getToday(), days);
}

export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' });
  }
}
