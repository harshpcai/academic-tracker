import { useState } from 'react';
import { Layers, Plus, X, CheckCircle, RotateCcw, BookOpen } from 'lucide-react';
import { useFlashcardDecks } from '../../context/AcademicContext';
import type { Flashcard, FlashcardDeck } from '../../types';
import { calculateDeckMastery } from '../../utils/helpers';

export default function FlashcardDeckBuilder() {
  const { decks, addDeck, updateDeck } = useFlashcardDecks();
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({ front: '', back: '' });
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const handleCreateDeck = () => {
    if (!deckName.trim()) return;
    addDeck({ name: deckName.trim(), cards: [] });
    setDeckName('');
    setShowDeckForm(false);
  };

  const handleAddCard = () => {
    if (!activeDeck || !cardForm.front.trim() || !cardForm.back.trim()) return;
    const newCard: Flashcard = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      deckId: activeDeck.id,
      front: cardForm.front.trim(),
      back: cardForm.back.trim(),
      status: 'new',
      lastReviewed: null,
      reviewCount: 0,
    };
    updateDeck({ ...activeDeck, cards: [...activeDeck.cards, newCard] });
    setCardForm({ front: '', back: '' });
    setShowCardForm(false);
  };

  const handleCardStatus = (cardId: string, status: Flashcard['status']) => {
    if (!activeDeck) return;
    const updatedCards = activeDeck.cards.map(c =>
      c.id === cardId ? { ...c, status, lastReviewed: new Date().toISOString(), reviewCount: c.reviewCount + 1 } : c
    );
    updateDeck({ ...activeDeck, cards: updatedCards });
  };

  const getStatusColor = (status: Flashcard['status']) => {
    switch (status) {
      case 'mastered': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'learning': return 'text-primary-glow bg-primary/10 border-primary/20';
      default: return 'text-text-tertiary bg-white/5 border-border';
    }
  };

  const getStatusLabel = (status: Flashcard['status']) => {
    switch (status) {
      case 'mastered': return 'Mastered';
      case 'review': return 'Needs Review';
      case 'learning': return 'Learning';
      default: return 'New';
    }
  };

  if (activeDeck) {
    const mastery = calculateDeckMastery(activeDeck);
    return (
      <div className="space-y-6 animate-enter">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveDeck(null); setFlippedCardId(null); }}
              className="p-2 rounded-lg hover:bg-white/5 text-text-tertiary transition-colors"
            >
              <BookOpen size={16} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{activeDeck.name}</h2>
              <span className="text-xs text-text-tertiary">{activeDeck.cards.length} cards</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-text-tertiary block">Mastery</span>
              <span className="text-sm font-semibold text-emerald-400">{mastery}%</span>
            </div>
            <button onClick={() => setShowCardForm(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} />
              Add Card
            </button>
          </div>
        </div>

        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${mastery}%` }}
          />
        </div>

        {activeDeck.cards.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-text-tertiary text-sm">
            No cards in this deck yet. Add your first flashcard to begin studying.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeck.cards.map(card => (
              <div
                key={card.id}
                className="perspective-1000 h-56"
                onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}
              >
                <div
                  className={`relative w-full h-full preserve-3d transition-transform duration-500 cursor-pointer ${
                    flippedCardId === card.id ? 'rotate-y-180' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 glass rounded-xl p-5 backface-hidden flex flex-col justify-between card-hover"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div>
                      <span className={`badge ${getStatusColor(card.status)} text-xs mb-3`}>
                        {getStatusLabel(card.status)}
                      </span>
                      <p className="text-sm text-text-primary font-medium leading-relaxed">{card.front}</p>
                    </div>
                    <span className="text-xs text-text-tertiary">Click to flip</span>
                  </div>
                  <div
                    className="absolute inset-0 glass rounded-xl p-5 backface-hidden flex flex-col justify-between rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-sm text-text-primary leading-relaxed">{card.back}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCardStatus(card.id, 'mastered'); }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={12} />
                        Mastered
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCardStatus(card.id, 'review'); }}
                        className="flex-1 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={12} />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCardForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCardForm(false)} />
            <div className="relative glass-strong rounded-2xl w-full max-w-md mx-4 p-6 animate-enter">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">New Flashcard</h3>
                <button onClick={() => setShowCardForm(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Question (Front)</label>
                  <textarea
                    value={cardForm.front}
                    onChange={e => setCardForm(prev => ({ ...prev, front: e.target.value }))}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="What is the question?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Answer (Back)</label>
                  <textarea
                    value={cardForm.back}
                    onChange={e => setCardForm(prev => ({ ...prev, back: e.target.value }))}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="What is the answer?"
                  />
                </div>
                <button onClick={handleAddCard} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Flashcard Decks</h2>
        </div>
        <button onClick={() => setShowDeckForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-text-tertiary text-sm">
          No decks created yet. Create your first flashcard deck to start active recall practice.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => {
            const mastery = calculateDeckMastery(deck);
            return (
              <button
                key={deck.id}
                onClick={() => setActiveDeck(deck)}
                className="glass rounded-xl p-5 text-left card-hover border border-border hover:border-border-strong transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <BookOpen size={18} className="text-primary-glow" />
                  <span className={`badge ${mastery >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : mastery >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-text-tertiary/10 text-text-tertiary border-border'} text-xs`}>
                    {mastery}% mastered
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{deck.name}</h3>
                <p className="text-xs text-text-tertiary">{deck.cards.length} cards</p>
                <div className="w-full h-1 bg-surface-elevated rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${mastery}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showDeckForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeckForm(false)} />
          <div className="relative glass-strong rounded-2xl w-full max-w-sm mx-4 p-6 animate-enter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">New Deck</h3>
              <button onClick={() => setShowDeckForm(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Deck Name</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Biology 101"
                />
              </div>
              <button onClick={handleCreateDeck} className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
