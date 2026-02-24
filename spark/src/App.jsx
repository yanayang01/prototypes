import { useState, useMemo } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WRONG_PENALTY = 5;
const HINT_PENALTY = 4;

function getMedal(score) {
  if (score === 100) return { label: "Perfect!", emoji: "🏆", color: "#a855f7" };
  if (score >= 90)   return { label: "Gold",     emoji: "🥇", color: "#f59e0b" };
  if (score >= 70)   return { label: "Silver",   emoji: "🥈", color: "#94a3b8" };
  if (score >= 50)   return { label: "Bronze",   emoji: "🥉", color: "#b45309" };
  return                    { label: "Complete", emoji: "✅", color: "#6b7280" };
}

// ---- DATA ----
const RARE_EARTH_ROUNDS = [
  { fact1: "China controls 90% of supply", fact2: "Powers your phone's vibration motor", answer: "NEODYMIUM" },
  { fact1: "Critical for EV batteries", fact2: "Named after Europe", answer: "EUROPIUM" },
  { fact1: "Makes jet engines heat resistant", fact2: "Subject of US-China trade war", answer: "DYSPROSIUM" },
  { fact1: "Used in cancer treatment", fact2: "Used in LED lights", answer: "YTTRIUM" },
  { fact1: "Powers night vision goggles", fact2: "Named after a village in Sweden", answer: "ERBIUM" },
];
const RARE_EARTH_STARTING_CARDS = ["NEODYMIUM", "EUROPIUM", "DYSPROSIUM", "YTTRIUM", "ERBIUM", "LANTHANUM", "CERIUM", "PRASEODYMIUM"];
const RARE_EARTH_INJECT = ["SAMARIUM", "GADOLINIUM", "HOLMIUM", "TERBIUM"];
const RARE_EARTH_COLORS = {
  NEODYMIUM: { bg: "#e4e8f0", border: "#a8b4cc", text: "#283a6b" }, EUROPIUM: { bg: "#f0e4e8", border: "#ccA8b4", text: "#6b2838" },
  DYSPROSIUM: { bg: "#e4f0e8", border: "#a8ccb4", text: "#286b3a" }, YTTRIUM: { bg: "#f0ece0", border: "#ccbc98", text: "#6b5020" },
  ERBIUM: { bg: "#f0e4f0", border: "#cca8cc", text: "#6b286b" }, LANTHANUM: { bg: "#e8f0e4", border: "#b4cca8", text: "#3a6b28" },
  CERIUM: { bg: "#f0eee0", border: "#ccc8a0", text: "#6b6020" }, PRASEODYMIUM: { bg: "#e0eef0", border: "#98c0cc", text: "#186080" },
  SAMARIUM: { bg: "#ece8f0", border: "#b8a8cc", text: "#483a6b" }, GADOLINIUM: { bg: "#e8ece4", border: "#b4c0a8", text: "#3a4828" },
  HOLMIUM: { bg: "#f0e8e4", border: "#ccb4a8", text: "#6b3828" }, TERBIUM: { bg: "#e4f0ec", border: "#a8ccbc", text: "#286b50" },
};

const ELEMENTS_ROUNDS = [
  { fact1: "Symbol is W", fact2: "Highest melting point of all metals", answer: "TUNGSTEN" },
  { fact1: "Named after a village in Sweden", fact2: "Powers pacemakers", answer: "LITHIUM" },
  { fact1: "Symbol is Sb", fact2: "Used in ancient Egypt as eyeliner", answer: "ANTIMONY" },
  { fact1: "Discovered in urine", fact2: "Strikes matches", answer: "PHOSPHORUS" },
  { fact1: "Rarest of the platinum group", fact2: "Used in catalytic converters", answer: "PALLADIUM" },
];
const ELEMENTS_STARTING_CARDS = ["TUNGSTEN", "LITHIUM", "ANTIMONY", "PHOSPHORUS", "PALLADIUM", "GOLD", "PLATINUM", "TITANIUM"];
const ELEMENTS_INJECT = ["OSMIUM", "IRIDIUM", "COBALT", "BISMUTH"];
const ELEMENTS_COLORS = {
  TUNGSTEN: { bg: "#e8e8e4", border: "#b8b8a8", text: "#3a3a28" }, LITHIUM: { bg: "#e4ecf0", border: "#a8c0cc", text: "#28506b" },
  ANTIMONY: { bg: "#ece4e8", border: "#c8a8b8", text: "#6b2848" }, PHOSPHORUS: { bg: "#eaf0e0", border: "#b0cc90", text: "#386b18" },
  PALLADIUM: { bg: "#e8e4f0", border: "#b0a8cc", text: "#3a286b" }, GOLD: { bg: "#f0ede0", border: "#ccbf88", text: "#6b5010" },
  PLATINUM: { bg: "#eaeaee", border: "#b8b8cc", text: "#3a3a58" }, TITANIUM: { bg: "#e4eaee", border: "#a8b8c8", text: "#28486b" },
  OSMIUM: { bg: "#e0e8e8", border: "#90b8b8", text: "#185858" }, IRIDIUM: { bg: "#eae8f0", border: "#b8b0cc", text: "#48386b" },
  COBALT: { bg: "#e0e4f0", border: "#90a8e0", text: "#18306b" }, BISMUTH: { bg: "#f0e4ec", border: "#ccA0bc", text: "#6b2858" },
};

const SPACE_HARD_ROUNDS = [
  { fact1: "Has Olympus Mons", fact2: "Phobos and Deimos moons", answer: "MARS" },
  { fact1: "God of the sea", fact2: "Discovered by math", answer: "NEPTUNE" },
  { fact1: "Hexagonal storm", fact2: "Second largest", answer: "SATURN" },
  { fact1: "Rotates differently", fact2: "Icy", answer: "URANUS" },
  { fact1: "Was a planet", fact2: "God of underworld", answer: "PLUTO" },
];
const SPACE_HARD_STARTING_CARDS = ["MARS", "NEPTUNE", "SATURN", "URANUS", "PLUTO", "JUPITER", "MERCURY", "VENUS"];
const SPACE_HARD_INJECT = ["MOON", "COMET", "GANYMEDE", "EUROPA"];
const SPACE_HARD_COLORS = {
  MARS: { bg: "#f0e4e0", border: "#ccaa9a", text: "#6b3020" }, NEPTUNE: { bg: "#e0e8f8", border: "#90a8e0", text: "#1e306b" },
  SATURN: { bg: "#f0ede0", border: "#ccbf98", text: "#6b5828" }, URANUS: { bg: "#e0f0ee", border: "#90c8c0", text: "#1e6b60" },
  PLUTO: { bg: "#ece8f0", border: "#b8a8cc", text: "#4a306b" }, JUPITER: { bg: "#f0ece0", border: "#ccbc98", text: "#6b5020" },
  MERCURY: { bg: "#eeeee8", border: "#c0c0a8", text: "#505030" }, VENUS: { bg: "#f0ece4", border: "#ccbca0", text: "#6b4828" },
  MOON: { bg: "#e8e8f0", border: "#b0b0cc", text: "#3a3a6b" }, COMET: { bg: "#e8e8f8", border: "#a8a8d8", text: "#28286b" },
  GANYMEDE: { bg: "#e4edf0", border: "#a8c2cc", text: "#2f5f6b" }, EUROPA: { bg: "#e8f0f0", border: "#a0c8cc", text: "#205858" },
};

const SPICE_ROUNDS = [
  { fact1: "A Spice Girl", fact2: "A spice", answer: "GINGER" },
  { fact1: "Not spicy for birds", fact2: "Turns food red", answer: "CAYENNE" },
  { fact1: "Often in a grinder", fact2: "A Roman obsession", answer: "BLACK PEPPER" },
  { fact1: "Native to Mexico", fact2: "Ice cream flavor", answer: "VANILLA" },
  { fact1: "In pumpkin spice mix", fact2: "Viral internet challenge", answer: "CINNAMON" },
];
const SPICE_STARTING_CARDS = ["GINGER", "VANILLA", "CAYENNE", "BLACK PEPPER", "CINNAMON", "LAVENDER", "SAFFRON", "CUMIN", "JALAPEÑO"];
const SPICE_INJECT = ["PAPRIKA", "TURMERIC", "CARDAMOM", "CLOVE"];
const SPICE_COLORS = {
  GINGER: { bg: "#e4edf0", border: "#a8c2cc", text: "#2f5f6b" }, VANILLA: { bg: "#ede4f0", border: "#c2a8cc", text: "#5e2f6b" },
  CAYENNE: { bg: "#e4f0e8", border: "#a8ccb2", text: "#2f6b3f" }, "BLACK PEPPER": { bg: "#f0e4eb", border: "#cca8bc", text: "#6b2f50" },
  CINNAMON: { bg: "#e8e4f0", border: "#b2a8cc", text: "#3f2f6b" }, LAVENDER: { bg: "#eee4f0", border: "#c8a8d0", text: "#5a2f70" },
  SAFFRON: { bg: "#f0ebe4", border: "#ccbaa8", text: "#6b4a2f" }, CUMIN: { bg: "#f0e4e4", border: "#cca8a8", text: "#6b2f2f" },
  JALAPEÑO: { bg: "#e4f0e6", border: "#a8ccac", text: "#2f6b36" }, PAPRIKA: { bg: "#f0e8e4", border: "#ccb0a8", text: "#6b3a2f" },
  TURMERIC: { bg: "#f0f0e0", border: "#cccc9a", text: "#5a5a20" }, CARDAMOM: { bg: "#e4f0ec", border: "#a8ccbc", text: "#2f6b50" },
  CLOVE: { bg: "#ece4f0", border: "#bca8cc", text: "#4a2f6b" },
};

const ANIMAL_ROUNDS = [
  { fact1: "Lives on a safari", fact2: "A zodiac sign", answer: "LION" },
  { fact1: "Wears a tuxedo", fact2: "Likes to swim", answer: "PENGUIN" },
  { fact1: "Has a pouch", fact2: "Is a boxer", answer: "KANGAROO" },
  { fact1: "First domesticated animal", fact2: "A constellation", answer: "DOG" },
  { fact1: "Those are not real horns", fact2: "One of two in its family", answer: "GIRAFFE" },
];
const ANIMAL_STARTING_CARDS = ["LION", "PENGUIN", "KANGAROO", "DOG", "GIRAFFE", "ELEPHANT", "TIGER", "KOALA", "DOLPHIN"];
const ANIMAL_INJECT = ["ZEBRA", "SQUIRREL", "SHARK", "BEAR"];
const ANIMAL_COLORS = {
  LION: { bg: "#f0ece0", border: "#ccc09a", text: "#6b5228" }, PENGUIN: { bg: "#e0ecf0", border: "#9ac0cc", text: "#28526b" },
  KANGAROO: { bg: "#f0e8e0", border: "#ccb49a", text: "#6b3e28" }, DOG: { bg: "#e8f0e0", border: "#b4cc9a", text: "#3e6b28" },
  GIRAFFE: { bg: "#f0f0e0", border: "#cccc9a", text: "#5a5a28" }, ELEPHANT: { bg: "#e8e0f0", border: "#b49acc", text: "#3e286b" },
  TIGER: { bg: "#f0e0e0", border: "#cc9a9a", text: "#6b2828" }, KOALA: { bg: "#ede8f0", border: "#c0aacb", text: "#5a3a6b" },
  DOLPHIN: { bg: "#e0f0ee", border: "#9accc6", text: "#28616b" }, ZEBRA: { bg: "#ececec", border: "#b0b0b0", text: "#3a3a3a" },
  SQUIRREL: { bg: "#f0ece4", border: "#ccbaa0", text: "#6b4e28" }, SHARK: { bg: "#e0e8f0", border: "#9ab0cc", text: "#28406b" },
  BEAR: { bg: "#ece8e0", border: "#c0b49a", text: "#5a4228" },
};

const SPACE_ROUNDS = [
  { fact1: "Our star", fact2: "Worshipped", answer: "SUN" },
  { fact1: "Influences tides", fact2: "Has a dark side", answer: "MOON" },
  { fact1: "Contains life", fact2: "Blue marble", answer: "EARTH" },
  { fact1: "Rover's on it", fact2: "Largest volcano", answer: "MARS" },
  { fact1: "Got a big red spot", fact2: "Lots of moons", answer: "JUPITER" },
];
const SPACE_STARTING_CARDS = ["SUN", "MOON", "EARTH", "MARS", "JUPITER", "NEPTUNE", "SATURN", "PLUTO"];
const SPACE_INJECT = ["MERCURY", "VENUS", "URANUS", "COMET"];
const SPACE_COLORS = {
  SUN: { bg: "#f0f0d8", border: "#cccc88", text: "#6b6b20" }, MOON: { bg: "#e8e8f0", border: "#b0b0cc", text: "#3a3a6b" },
  EARTH: { bg: "#e0eef0", border: "#90bcc8", text: "#1e566b" }, MARS: { bg: "#f0e4e0", border: "#ccaa9a", text: "#6b3020" },
  JUPITER: { bg: "#f0ece0", border: "#ccbc98", text: "#6b5020" }, NEPTUNE: { bg: "#e0e8f8", border: "#90a8e0", text: "#1e306b" },
  SATURN: { bg: "#f0ede0", border: "#ccbf98", text: "#6b5828" }, PLUTO: { bg: "#ece8f0", border: "#b8a8cc", text: "#4a306b" },
  MERCURY: { bg: "#eeeee8", border: "#c0c0a8", text: "#505030" }, VENUS: { bg: "#f0ece4", border: "#ccbca0", text: "#6b4828" },
  URANUS: { bg: "#e0f0ee", border: "#90c8c0", text: "#1e6b60" }, COMET: { bg: "#e8e8f8", border: "#a8a8d8", text: "#28286b" },
};

// ---- GAME ----
function Game({ rounds, startingCards, injectCards, colors, accent, emoji, title, onBack }) {
  const shuffledStart = useMemo(() => shuffle(startingCards), []);
  const shuffledInject = useMemo(() => shuffle(injectCards), []);

  const [queue, setQueue] = useState(rounds.map((_, i) => i));
  const [currentQueueIdx, setCurrentQueueIdx] = useState(0);
  const [skipped, setSkipped] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [deck, setDeck] = useState(shuffledStart);
  const [disabledCards, setDisabledCards] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(100);
  const [done, setDone] = useState(false);
  const [injectCount, setInjectCount] = useState(0);

  const roundIdx = queue[currentQueueIdx];
  const cur = rounds[roundIdx];
  const isRevisit = skipped.includes(roundIdx);
  const totalRounds = rounds.length;

  const advanceQueue = (newDeck, newSkipped, newCompleted, newInjectCount) => {
    const nextQueueIdx = currentQueueIdx + 1;
    if (nextQueueIdx >= queue.length) {
      const remaining = newSkipped.filter(i => !newCompleted.includes(i));
      if (remaining.length === 0) {
        setDone(true);
      } else {
        setQueue(q => [...q, ...remaining]);
        setCurrentQueueIdx(nextQueueIdx);
      }
    } else {
      setCurrentQueueIdx(nextQueueIdx);
    }
    setDeck(newDeck);
    setDisabledCards([]);
    setSelected(null);
    setFeedback(null);
    setInjectCount(newInjectCount);
  };

  const handleSelect = (card) => {
    if (disabledCards.includes(card) || feedback === 'correct') return;
    setSelected(card);
    setFeedback(null);
  };

  const handlePlace = () => {
    if (!selected || disabledCards.includes(selected) || feedback === 'correct') return;
    if (selected === cur.answer) {
      setFeedback('correct');
      const newCompleted = [...completed, roundIdx];
      setCompleted(newCompleted);
      setTimeout(() => {
        const newDeck = deck.filter(c => c !== cur.answer);
        let newInjectCount = injectCount;
        if (shuffledInject[injectCount]) {
          newDeck.push(shuffledInject[injectCount]);
          newInjectCount++;
        }
        advanceQueue(shuffle(newDeck), skipped, newCompleted, newInjectCount);
      }, 900);
    } else {
      setFeedback('wrong');
      setScore(s => Math.max(50, s - WRONG_PENALTY));
      setTimeout(() => setFeedback(null), 700);
    }
  };

  const handleSkip = () => {
    if (feedback === 'correct') return;
    const newSkipped = skipped.includes(roundIdx) ? skipped : [...skipped, roundIdx];
    setSkipped(newSkipped);
    advanceQueue(deck, newSkipped, completed, injectCount);
  };

  const handleHint = () => {
    const wrong = deck.filter(c => c !== cur.answer && !disabledCards.includes(c) && c !== selected);
    if (!wrong.length) return;
    const pick = wrong[Math.floor(Math.random() * wrong.length)];
    setDisabledCards(d => [...d, pick]);
    if (selected === pick) setSelected(null);
    setScore(s => Math.max(50, s - HINT_PENALTY));
  };

  const restart = () => {
    setQueue(rounds.map((_, i) => i));
    setCurrentQueueIdx(0); setSkipped([]); setCompleted([]);
    setDeck(shuffle(startingCards)); setDisabledCards([]);
    setSelected(null); setFeedback(null); setScore(100);
    setDone(false); setInjectCount(0);
  };

  const medal = getMedal(score);
  const bg = { minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 16 };
  const wrap = { background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 480, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", alignItems: "center" };

  if (done) return (
    <div style={bg}><div style={wrap}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{medal.emoji}</div>
      <h2 style={{ fontSize: 26, marginBottom: 4, color: "#2d2d2d" }}>{medal.label}</h2>
      <div style={{ width: 120, height: 120, borderRadius: "50%", border: `6px solid ${medal.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "16px auto", boxShadow: `0 0 24px ${medal.color}44` }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: medal.color }}>{score}%</span>
        <span style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>accuracy</span>
      </div>
      <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 24, textAlign: "center" }}>
        {score === 100 ? "Flawless — no hints, no wrong answers!" : "Each wrong guess cost 5% · Each hint cost 4%"}
      </p>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={onBack} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "2px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>← Menu</button>
        <button onClick={restart} style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Play Again</button>
      </div>
    </div></div>
  );

  return (
    <div style={bg}><div style={wrap}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ background: `${accent}22`, color: accent, fontWeight: 700, fontSize: 14, padding: "4px 14px", borderRadius: 20, border: `1px solid ${accent}55` }}>{emoji} {title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ color: "#aaa", fontSize: 13 }}>{completed.length} / {totalRounds} solved</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: score === 100 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#f97316" }}>{score}% accuracy</span>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
        {rounds.map((_, i) => {
          const isComp = completed.includes(i);
          const isSkip = skipped.includes(i) && !isComp;
          const isCur = i === roundIdx;
          return (
            <div key={i} title={isComp ? "Solved" : isSkip ? "Skipped" : ""} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: isComp ? accent : isSkip ? "#f59e0b" : isCur ? `${accent}88` : "#e5e7eb",
              border: isCur ? `2px solid ${accent}` : "2px solid transparent",
              transition: "all 0.3s",
            }} />
          );
        })}
      </div>

      {isRevisit && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#854d0e", marginBottom: 12, fontWeight: 600 }}>
          ↩ Revisiting skipped round
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 12, padding: "14px 10px", textAlign: "center", fontWeight: 600, fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{cur.fact1}</div>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 14, height: 2, background: "#e5e7eb" }} />
          <div style={{ width: 64, height: 40, border: `2px dashed ${accent}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}11` }}>
            {selected ? <span style={{ fontWeight: 700, color: accent, fontSize: 11 }}>{selected}</span> : <span style={{ color: "#ccc", fontSize: 12 }}>?</span>}
          </div>
          <div style={{ width: 14, height: 2, background: "#e5e7eb" }} />
        </div>
        <div style={{ flex: 1, background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 12, padding: "14px 10px", textAlign: "center", fontWeight: 600, fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{cur.fact2}</div>
      </div>

      <div style={{ height: 24, margin: "6px 0 10px", textAlign: "center" }}>
        {feedback === 'correct' && <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14 }}>✓ Correct!</span>}
        {feedback === 'wrong' && <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>✗ Not quite — try another (-5%)</span>}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", width: "100%" }}>
        {deck.map(card => {
          const isDisabled = disabledCards.includes(card);
          const isSel = selected === card;
          const col = colors[card] || { bg: "#f0f0f0", border: "#ccc", text: "#555" };
          return (
            <button key={card} onClick={() => handleSelect(card)} disabled={isDisabled} style={{
              padding: "10px 16px", borderRadius: 10, fontWeight: isSel ? 800 : 600, fontSize: 13,
              transition: "all 0.15s", opacity: isDisabled ? 0.3 : 1,
              background: col.bg, border: `2px solid ${isSel ? col.text : col.border}`,
              color: isDisabled ? "#bbb" : col.text,
              transform: isSel ? "scale(1.06)" : "scale(1)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              textDecoration: isDisabled ? "line-through" : "none",
              boxShadow: isSel ? `0 4px 12px ${col.border}99` : "0 1px 4px rgba(0,0,0,0.07)",
            }}>{card}</button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
        <button onClick={onBack} style={{ padding: "11px 12px", borderRadius: 10, border: "2px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>←</button>
        <button onClick={handleHint} disabled={deck.filter(c => c !== cur.answer && !disabledCards.includes(c)).length === 0} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "2px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>💡 Hint (-4%)</button>
        <button onClick={handleSkip} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "2px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>⏭ Skip</button>
        <button onClick={handlePlace} disabled={!selected || feedback === 'correct'} style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: selected ? "pointer" : "not-allowed", opacity: selected ? 1 : 0.4 }}>Check</button>
      </div>
    </div></div>
  );
}

// ---- COVER ----
function Cover({ onSelect }) {
  const editions = [
    { id: "space", emoji: "🚀", title: "Space", desc: "Stars, rovers, and red spots — how well do you know the cosmos?", accent: "#6366f1", bg: "linear-gradient(135deg, #e8e0f8, #d0c8f0)", stars: 1 },
    { id: "animals", emoji: "🐾", title: "Animals", desc: "Tuxedos, pouches, and ossicones — do you know your animals?", accent: "#22c55e", bg: "linear-gradient(135deg, #e0f5e0, #c0eac0)", stars: 2 },
    { id: "spices", emoji: "🌶️", title: "Spices", desc: "From sushi to ancient Rome — can you connect the clues?", accent: "#f97316", bg: "linear-gradient(135deg, #fff0e0, #ffe0c0)", stars: 3 },
    { id: "space-hard", emoji: "🌌", title: "More Space", desc: "Hexagonal storms, icy giants, and dwarf planets — think you know space?", accent: "#4f46e5", bg: "linear-gradient(135deg, #d8d0f8, #b8b0e8)", stars: 4 },
    { id: "elements", emoji: "⚗️", title: "Elements", desc: "Symbols, eyeliner, and urine — the periodic table like you've never seen it.", accent: "#dc2626", bg: "linear-gradient(135deg, #fce8e8, #f8d0d0)", stars: 5 },
    { id: "rare-earth", emoji: "💀", title: "Impossible Challenge", desc: "Rare earth metals, trade wars, and night vision — good luck.", accent: "#7c3aed", bg: "linear-gradient(135deg, #ede0f8, #d8c0f0)", stars: 5 },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔗</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -1 }}>The Missing Link</h1>
        <p style={{ color: "#94a3b8", fontSize: 15, marginTop: 8 }}>Two clues. One answer. Can you find the connection?</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 420 }}>
        {editions.map(ed => (
          <button key={ed.id} onClick={() => onSelect(ed.id)} style={{ background: ed.bg, border: "none", borderRadius: 20, padding: "20px 24px", cursor: "pointer", textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 36 }}>{ed.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>{ed.title}</div>
                  <span style={{ fontSize: 12, letterSpacing: 1, color: "#f59e0b" }}>{"★".repeat(ed.stars)}{"☆".repeat(5 - ed.stars)}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.4 }}>{ed.desc}</div>
              </div>
              <div style={{ fontSize: 22, color: ed.accent }}>›</div>
            </div>
          </button>
        ))}
      </div>
      <p style={{ color: "#475569", fontSize: 12, marginTop: 32 }}>More editions coming soon</p>
    </div>
  );
}

// ---- APP ----
export default function App() {
  const [screen, setScreen] = useState("cover");
  const back = () => setScreen("cover");
  if (screen === "space") return <Game rounds={SPACE_ROUNDS} startingCards={SPACE_STARTING_CARDS} injectCards={SPACE_INJECT} colors={SPACE_COLORS} accent="#6366f1" emoji="🚀" title="Space" onBack={back} />;
  if (screen === "animals") return <Game rounds={ANIMAL_ROUNDS} startingCards={ANIMAL_STARTING_CARDS} injectCards={ANIMAL_INJECT} colors={ANIMAL_COLORS} accent="#22c55e" emoji="🐾" title="Animals" onBack={back} />;
  if (screen === "spices") return <Game rounds={SPICE_ROUNDS} startingCards={SPICE_STARTING_CARDS} injectCards={SPICE_INJECT} colors={SPICE_COLORS} accent="#f97316" emoji="🌶️" title="Spices" onBack={back} />;
  if (screen === "space-hard") return <Game rounds={SPACE_HARD_ROUNDS} startingCards={SPACE_HARD_STARTING_CARDS} injectCards={SPACE_HARD_INJECT} colors={SPACE_HARD_COLORS} accent="#4f46e5" emoji="🌌" title="More Space" onBack={back} />;
  if (screen === "elements") return <Game rounds={ELEMENTS_ROUNDS} startingCards={ELEMENTS_STARTING_CARDS} injectCards={ELEMENTS_INJECT} colors={ELEMENTS_COLORS} accent="#dc2626" emoji="⚗️" title="Elements" onBack={back} />;
  if (screen === "imp-animals") return <Game rounds={IMP_ANIMAL_ROUNDS} startingCards={IMP_ANIMAL_STARTING_CARDS} injectCards={IMP_ANIMAL_INJECT} colors={IMP_ANIMAL_COLORS} accent="#0891b2" emoji="🧠" title="Impossible Animals" onBack={back} />;
  if (screen === "rare-earth") return <Game rounds={RARE_EARTH_ROUNDS} startingCards={RARE_EARTH_STARTING_CARDS} injectCards={RARE_EARTH_INJECT} colors={RARE_EARTH_COLORS} accent="#7c3aed" emoji="💀" title="Impossible Challenge" onBack={back} />;
  return <Cover onSelect={setScreen} />;
}
