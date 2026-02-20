export interface Question {
  id: number;
  question: string;
  answers: { a: string; b: string; c: string; d: string };
  correct: 'a' | 'b' | 'c' | 'd';
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
}
