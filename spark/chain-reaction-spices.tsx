import { useState } from "react";

const GAMES = [
  {
    title: "Space", stars: 1,
    chain: [
      { fact: "We live here",       card: { id: 1, text: "Earth" } },
      { fact: "Is an inner planet", card: { id: 2, text: "Mars" } },
      { fact: "Orbits the Sun",     card: { id: 3, text: "Jupiter" } },
      { fact: "Is a gas giant",     card: { id: 4, text: "Saturn" } },
      { fact: "Named after a god",  card: { id: 5, text: "Pluto" } },
    ],
    finalFact: "Is a star",
    distractors: [{ id: 6, text: "Uranus" }, { id: 7, text: "Neptune" }, { id: 8, text: "Moon" }],
  },
  {
    title: "Animals", stars: 2,
    chain: [
      { fact: "Fastest land animal", card: { id: 1, text: "Cheetah" } },
      { fact: "Is a feline",         card: { id: 2, text: "Cat" } },
      { fact: "Common pet",          card: { id: 3, text: "Dog" } },
      { fact: "Been to space",       card: { id: 4, text: "Fruit Fly" } },
      { fact: "Hatches from an egg", card: { id: 5, text: "Platypus" } },
    ],
    finalFact: "Is venomous",
    distractors: [{ id: 6, text: "Tiger" }, { id: 7, text: "Duck" }, { id: 8, text: "Frog" }],
  },
  {
    title: "Spices", stars: 3,
    chain: [
      { fact: "Grows in India",      card: { id: 1, text: "Black Pepper" } },
      { fact: "Is a berry",          card: { id: 2, text: "Allspice" } },
      { fact: "From the Americas",   card: { id: 3, text: "Vanilla" } },
      { fact: "Expensive spice",     card: { id: 4, text: "Saffron" } },
      { fact: "Also used as a dye",  card: { id: 5, text: "Turmeric" } },
    ],
    finalFact: "Comes from a root",
    distractors: [{ id: 6, text: "Cinnamon" }, { id: 7, text: "Cumin" }, { id: 8, text: "Cardamom" }],
  },
  {
    title: "Human Body", stars: 4,
    chain: [
      { fact: "Contains a lens",                    card: { id: 1, text: "Eyes" } },
      { fact: "Is pigmented",                       card: { id: 2, text: "Hair" } },
      { fact: "Regrows continuously",               card: { id: 3, text: "Nails" } },
      { fact: "Illness can cause a change in color",card: { id: 4, text: "Skin" } },
      { fact: "Home to microbiota",                 card: { id: 5, text: "Stomach" } },
    ],
    finalFact: "Refreshes itself every 3 days",
    distractors: [{ id: 6, text: "Brain" }, { id: 7, text: "Liver" }, { id: 8, text: "Teeth" }],
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function SlotButton({ slot, index, selected, submitted, chain, onSlotClick }) {
  const status = submitted && slot ? (slot.id === chain[index].card.id ? "correct" : "wrong") : null;

  let cls = "w-full rounded-xl px-4 py-2 text-sm font-semibold border-2 transition-all text-center ";
  if (submitted) {
    cls += status === "correct" ? "bg-green-900 border-green-500 text-green-200" :
           status === "wrong"   ? "bg-red-900 border-red-500 text-red-200" :
                                  "bg-gray-800 border-gray-700 text-gray-500";
  } else if (slot) {
    cls += "bg-gray-700 border-blue-500 text-white";
  } else if (selected !== null) {
    cls += "bg-gray-800 border-dashed border-yellow-500 text-yellow-400";
  } else {
    cls += "bg-gray-800 border-dashed border-gray-700 text-gray-600";
  }

  let label;
  if (slot) {
    label = slot.text;
  } else if (submitted) {
    label = "— " + chain[index].card.text + " —";
  } else if (selected !== null) {
    label = "Place here";
  } else {
    label = "_ _ _";
  }

  return (
    <div className="w-full">
      <button onClick={() => onSlotClick(index)} className={cls}>
        {label}
        {submitted && status === "wrong" && slot && (
          <div className="text-xs text-red-400 font-normal mt-0.5">
            Should be: {chain[index].card.text}
          </div>
        )}
        {submitted && status === "correct" && (
          <span className="ml-1 text-xs">✓</span>
        )}
      </button>
    </div>
  );
}

function Game({ game, onBack }) {
  const allCards = [...game.chain.map(c => c.card), ...game.distractors];
  const [hand, setHand] = useState(() => shuffle(allCards));
  const [slots, setSlots] = useState(Array(game.chain.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSlotClick = (i) => {
    if (submitted) return;
    if (slots[i]) {
      const card = slots[i];
      setSlots(s => s.map((c, idx) => idx === i ? null : c));
      setHand(h => shuffle([...h, card]));
      setSelected(null);
      return;
    }
    if (selected !== null) {
      const card = hand.find(c => c.id === selected);
      if (!card) return;
      setSlots(s => s.map((c, idx) => idx === i ? card : c));
      setHand(h => h.filter(c => c.id !== selected));
      setSelected(null);
    }
  };

  const handleCardClick = (card) => {
    if (submitted) return;
    setSelected(s => s === card.id ? null : card.id);
  };

  const evaluate = () => {
    const correct = slots.filter((card, i) => card && card.id === game.chain[i].card.id).length;
    setScore(correct);
    setSubmitted(true);
  };

  const reset = () => {
    setHand(shuffle(allCards));
    setSlots(Array(game.chain.length).fill(null));
    setSubmitted(false);
    setScore(null);
    setSelected(null);
  };

  const allFilled = slots.every(s => s !== null);

  return (
    <div className="max-w-sm mx-auto">
      <button onClick={onBack} className="text-gray-500 hover:text-white text-xs mb-4">
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold text-center mb-1">Chain Reaction</h1>
      <p className="text-center text-gray-400 text-sm mb-1">
        Topic: <span className="text-white font-semibold">{game.title}</span>
      </p>
      <p className="text-center text-gray-500 text-xs mb-6">
        Select a card from your hand, then tap a slot to place it.
      </p>

      <div className="flex flex-col items-center mb-8">
        {game.chain.map((node, i) => (
          <div key={i} className="w-full flex flex-col items-center">
            <div className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-center text-sm text-blue-200">
              {node.fact}
            </div>
            <div className="text-gray-600 text-lg leading-none my-0.5">↓</div>
            <SlotButton
              slot={slots[i]}
              index={i}
              selected={selected}
              submitted={submitted}
              chain={game.chain}
              onSlotClick={handleSlotClick}
            />
            {i < game.chain.length - 1 && (
              <div className="text-gray-600 text-lg leading-none my-0.5">↓</div>
            )}
          </div>
        ))}
        <div className="text-gray-600 text-lg leading-none my-0.5">↓</div>
        <div className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-center text-sm text-blue-200">
          {game.finalFact}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Your Hand ({hand.length} cards)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {hand.length === 0 && (
            <p className="text-gray-600 text-sm italic col-span-2">All cards placed</p>
          )}
          {hand.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={
                "rounded-xl px-3 py-3 text-sm font-semibold border-2 transition-all " +
                (selected === card.id
                  ? "bg-yellow-900 border-yellow-400 text-yellow-100"
                  : "bg-gray-800 border-gray-600 hover:border-blue-400 text-white")
              }
            >
              {card.text}
            </button>
          ))}
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={evaluate}
          disabled={!allFilled}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl py-3 font-semibold transition-colors"
        >
          {allFilled ? "Submit Chain" : "Fill all 5 slots to submit"}
        </button>
      ) : (
        <div className="bg-gray-800 rounded-xl p-5 text-center">
          <p className="text-4xl font-bold text-blue-400 mb-1">{score} / 5</p>
          <p className="text-gray-400 text-sm mb-4">
            {score === 5 ? "Perfect chain!" : score >= 3 ? "Good effort — review corrections above." : "Keep practicing!"}
          </p>
          <button onClick={reset} className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 py-2 font-semibold transition-colors">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 font-sans">
        <Game game={GAMES[selected]} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-sans flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-center mb-1">Chain Reaction</h1>
      <p className="text-center text-gray-400 text-sm mb-8">Choose a topic to begin</p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {GAMES.map((g, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="bg-gray-800 border border-gray-600 hover:border-blue-400 rounded-xl px-6 py-5 text-left transition-colors"
          >
            <p className="font-bold text-white mb-1">{g.title}</p>
            <p className="text-yellow-400 text-sm">
              {"★".repeat(g.stars) + "☆".repeat(5 - g.stars)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
