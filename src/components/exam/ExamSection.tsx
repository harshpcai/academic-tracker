import SpacedRepetition from './SpacedRepetition';
import FlashcardDeckBuilder from './FlashcardDeck';
import ERIModule from './ERIModule';
import FeynmanNotebook from './FeynmanNotebook';

export default function ExamSection() {
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gradient-primary mb-1">Exam Preparation Hub</h1>
        <p className="text-sm text-text-secondary">Spaced repetition, active recall, readiness analytics, and Feynman technique mastery.</p>
      </div>
      <SpacedRepetition />
      <div className="divider" />
      <FlashcardDeckBuilder />
      <div className="divider" />
      <ERIModule />
      <div className="divider" />
      <FeynmanNotebook />
    </div>
  );
}
