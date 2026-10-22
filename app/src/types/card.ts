export type Topic = 'rust' | 'c' | 'cpp' | 'embedded' | 'electronics';
export type CodeLang = 'c' | 'cpp' | 'rust';

interface CardBase {
  id: string;
  topic: Topic;
  /** Bug patterns this card trains, e.g. "isr", "rmw-race". Used for weak-pattern stats. */
  tags: string[];
  difficulty: 1 | 2 | 3;
}

export interface QuizCard extends CardBase {
  type: 'quiz';
  title: string;
  lang?: CodeLang;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface BugCard extends CardBase {
  type: 'bug';
  title: string;
  lang: CodeLang;
  code: string;
  /** 1-based line numbers; tapping any of them counts as correct. */
  bugLines: number[];
  explain: string;
  fix?: string;
}

export interface PrCard extends CardBase {
  type: 'pr';
  lang: CodeLang;
  pr: {
    title: string;
    author: string;
    body: string;
    verdict: 'approve' | 'changes';
  };
  /** Unified diff body: each line starts with '+', '-' or ' '. */
  diff: string;
  explain: string;
}

export interface ConceptCard extends CardBase {
  type: 'concept';
  title: string;
  bullets: string[];
}

export type Card = QuizCard | BugCard | PrCard | ConceptCard;

/** Feed filter: a topic, or "pr" for PR-review cards of any topic. */
export type FeedFilter = Topic | 'pr';
