// Core types for the English Learning App

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: CEFRLevel;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  order: number;
  totalLessons: number;
  estimatedHours: number;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  content: LessonContent;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  exercises: Exercise[];
  dialogue?: Dialogue;
  culturalNote?: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  audioUrl?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'conjunction' | 'interjection' | 'determiner';
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  explanation: string;
  examples: GrammarExample[];
  rules: string[];
}

export interface GrammarExample {
  sentence: string;
  translation: string;
  highlight?: string;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'ordering';

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  instruction?: string;
  options?: ExerciseOption[];
  correctAnswer: string | string[];
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  xpReward: number;
  difficulty: 1 | 2 | 3;
}

export interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Dialogue {
  id: string;
  title: string;
  lines: DialogueLine[];
  audioUrl?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
  audioUrl?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  score: number;
  completedExercises: string[];
  timeSpent: number;
  lastAttemptAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'xp' | 'lessons' | 'perfect' | 'speed' | 'special';
  requirement: AchievementRequirement;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'streak_days' | 'total_xp' | 'lessons_completed' | 'perfect_lessons' | 'daily_goal' | 'level_up';
  value: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

export interface DailyGoal {
  id: string;
  userId: string;
  date: string;
  targetXP: number;
  earnedXP: number;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  level: CEFRLevel;
  xp: number;
  streak: number;
  rank: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// CEFR Level utilities
export const CEFR_LEVELS: { value: CEFRLevel; label: string; description: string; color: string }[] = [
  { value: 'A1', label: 'A1 - Iniciante', description: 'Compreende e usa expressões familiares', color: 'bg-green-500' },
  { value: 'A2', label: 'A2 - Básico', description: 'Comunica-se em tarefas simples e rotineiras', color: 'bg-lime-500' },
  { value: 'B1', label: 'B1 - Intermediário', description: 'Lida com situações da vida cotidiana', color: 'bg-yellow-500' },
  { value: 'B2', label: 'B2 - Intermediário Avançado', description: 'Interage com fluência e espontaneidade', color: 'bg-orange-500' },
  { value: 'C1', label: 'C1 - Avançado', description: 'Expressa-se fluentemente sem procurar palavras', color: 'bg-red-500' },
  { value: 'C2', label: 'C2 - Proficiência', description: 'Compreende praticamente tudo sem esforço', color: 'bg-purple-500' },
];

export const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function getLevelIndex(level: CEFRLevel): number {
  return CEFR_ORDER.indexOf(level);
}

export function getNextLevel(level: CEFRLevel): CEFRLevel | null {
  const index = getLevelIndex(level);
  if (index === -1 || index === CEFR_ORDER.length - 1) return null;
  return CEFR_ORDER[index + 1];
}

export function getPreviousLevel(level: CEFRLevel): CEFRLevel | null {
  const index = getLevelIndex(level);
  if (index <= 0) return null;
  return CEFR_ORDER[index - 1];
}

export function getLevelColor(level: CEFRLevel): string {
  const levelInfo = CEFR_LEVELS.find(l => l.value === level);
  return levelInfo?.color || 'bg-gray-500';
}

export function getLevelLabel(level: CEFRLevel): string {
  const levelInfo = CEFR_LEVELS.find(l => l.value === level);
  return levelInfo?.label || level;
}