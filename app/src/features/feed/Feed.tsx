import { useMemo, useState } from 'react';
import { useCards } from '../../api/useCards';
import { todayKey, useProgressStore } from '../../store/progressStore';
import type { Card } from '../../types/card';
import { BugCardView } from './BugCardView';
import { buildQueue } from './buildQueue';
import { CardShell } from './CardShell';
import { ConceptCardView } from './ConceptCardView';
import { DoneScreen } from './DoneScreen';
import { FeedHeader } from './FeedHeader';
import { PrCardView } from './PrCardView';
import { QuizCardView } from './QuizCardView';

const scrollTo = (index: number) =>
  document.getElementById(`card-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function Feed() {
  const { data: cards, isLoading, error } = useCards();
  const filters = useProgressStore((s) => s.filters);
  const today = useProgressStore((s) => s.today);
  const goal = useProgressStore((s) => s.dailyGoal);
  const record = useProgressStore((s) => s.record);
  const [extra, setExtra] = useState(0);
  const answeredToday = today.date === todayKey() ? today.answered : 0;
  // Fixed at app start, so the session does not shrink while you answer.
  const [answeredAtStart] = useState(answeredToday);

  const filterKey = filters.join(',');
  // Built once per filter change. Progress is read without subscribing,
  // so answering a card does not reshuffle the feed under your finger.
  const queue = useMemo(
    () => (cards ? buildQueue(cards, useProgressStore.getState().cards, filters) : []),
    [cards, filters],
  );

  const sessionLength = Math.min(queue.length, Math.max(goal - answeredAtStart, 5) + extra);
  const visible = queue.slice(0, sessionLength);

  if (isLoading) return <Centered>Loading cards…</Centered>;
  if (error) return <Centered>Could not load cards: {error.message}</Centered>;

  const renderCard = (card: Card, index: number) => {
    const props = {
      onAnswered: (correct: boolean) => record(card.id, card.tags, correct),
      onNext: () => scrollTo(index + 1),
    };
    switch (card.type) {
      case 'quiz':
        return <QuizCardView card={card} {...props} />;
      case 'bug':
        return <BugCardView card={card} {...props} />;
      case 'pr':
        return <PrCardView card={card} {...props} />;
      case 'concept':
        return <ConceptCardView card={card} {...props} />;
    }
  };

  return (
    <>
      <FeedHeader answered={answeredToday} goal={goal} />
      <main key={filterKey} className="h-dvh snap-y snap-proximity overflow-y-auto">
        {visible.length === 0 && <Centered>No cards for this filter yet.</Centered>}
        {visible.map((card, i) => (
          <CardShell key={card.id} card={card} index={i}>
            {renderCard(card, i)}
          </CardShell>
        ))}
        {visible.length > 0 && (
          <DoneScreen
            index={visible.length}
            hasMore={visible.length < queue.length}
            onMore={() => {
              setExtra((e) => e + 10);
              requestAnimationFrame(() => scrollTo(visible.length));
            }}
          />
        )}
      </main>
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-dvh place-items-center px-6 text-center text-muted">{children}</div>;
}
