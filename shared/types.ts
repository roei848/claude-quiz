export interface Question {
  id: number;
  question: string;
  answers: { a: string; b: string; c: string; d: string };
  correct: AnswerKey;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
}

export type AnswerKey = 'a' | 'b' | 'c' | 'd';

export interface PlayerPublic {
  id: string;
  nickname: string;
  score: number;
}

export type GamePhase =
  | 'lobby'
  | 'question'
  | 'reveal'
  | 'leaderboard'
  | 'finished';

export interface RoomState {
  roomCode: string;
  phase: GamePhase;
  players: PlayerPublic[];
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  answeredCount: number;
}

export interface QuestionForHost {
  question: string;
  answers: { a: string; b: string; c: string; d: string };
  questionNumber: number;
  totalQuestions: number;
}

export interface RevealData {
  correctAnswer: AnswerKey;
  explanation: string;
  distribution: { a: number; b: number; c: number; d: number };
  questionText: string;
  answers: { a: string; b: string; c: string; d: string };
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  rank: number;
  delta: number;
}

export interface AnswerFeedback {
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
  rank: number;
  totalPlayers: number;
  correctAnswer: AnswerKey;
}

// Socket event payloads
export interface ClientJoinPayload {
  roomCode: string;
  nickname: string;
}

export interface ClientAnswerPayload {
  roomCode: string;
  answer: AnswerKey;
}

export interface HostStartPayload {
  roomCode: string;
}

export interface HostNextPayload {
  roomCode: string;
}
