import { useState } from "react";

var DEFAULT_ITEMS = [
  "Black pepper","Cinnamon","Vanilla","Ginger","Allspice",
  "Nutmeg","Clove","Chili Pepper","Cocoa","Turmeric","Saffron"
];
var DEFAULT_FACTS = [
  "Can be used fresh","Common in desserts","Dried berries",
  "Grows above ground","Grows below ground","In pumpkin spice mix",
  "Native to India","Native to Indonesia","Native to the Americas",
  "Used as a dye"
];
var DEFAULT_LINKS = [
  [0,6],[0,3],[0,2],[1,6],[1,5],[1,3],[1,1],
  [2,8],[2,3],[2,1],[2,0],[3,6],[3,5],[3,4],[3,0],
  [4,8],[4,5],[4,3],[4,2],[5,7],[5,5],[5,3],[5,2],
  [6,7],[6,5],[6,3],[6,2],[7,8],[7,3],[7,0],
  [8,8],[8,3],[8,1],[9,6],[9,4],[9,9],[9,0],[10,3],[10,9],
];

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function buildLinkMap(links) {
  var m = {};
  for (var i = 0; i < links.length; i++) {
    var ck = "c" + links[i][0], fk = "f" + links[i][1];
    if (!m[ck]) m[ck] = new Set(); if (!m[fk]) m[fk] = new Set();
    m[ck].add(fk); m[fk].add(ck);
  }
  return m;
}

function layoutGraph(nodes, edges, w) {
  if (!nodes.length) return { pos: {}, h: 200 };
  if (nodes.length === 1) return { pos: { [nodes[0].id]: { x: w / 2, y: 50 } }, h: 100 };

  var itemN = nodes.filter(function(n) { return n.type === "item"; });
  var factN = nodes.filter(function(n) { return n.type === "fact"; });
  var pos = {};
  var nodeH = 52;
  var pad = 45;
  var leftX = w * 0.22, rightX = w * 0.78;
  var maxRows = Math.max(itemN.length, factN.length);
  var totalH = Math.max(200, pad * 2 + (maxRows - 1) * nodeH + 32);

  itemN.forEach(function(n, i) {
    var sp = itemN.length > 1 ? (totalH - pad * 2) / (itemN.length - 1) : 0;
    pos[n.id] = { x: leftX, y: pad + i * sp };
  });
  factN.forEach(function(n, i) {
    var sp = factN.length > 1 ? (totalH - pad * 2) / (factN.length - 1) : 0;
    pos[n.id] = { x: rightX, y: pad + i * sp };
  });

  for (var pass = 0; pass < 12; pass++) {
    factN.sort(function(a, b) {
      var an = edges.filter(function(e) { return e[0] === a.id || e[1] === a.id; }).map(function(e) { return e[0] === a.id ? e[1] : e[0]; });
      var bn = edges.filter(function(e) { return e[0] === b.id || e[1] === b.id; }).map(function(e) { return e[0] === b.id ? e[1] : e[0]; });
      var aa = an.length ? an.reduce(function(s, id) { return s + (pos[id] ? pos[id].y : 0); }, 0) / an.length : pos[a.id].y;
      var ba = bn.length ? bn.reduce(function(s, id) { return s + (pos[id] ? pos[id].y : 0); }, 0) / bn.length : pos[b.id].y;
      return aa - ba;
    });
    factN.forEach(function(n, i) {
      var sp = factN.length > 1 ? (totalH - pad * 2) / (factN.length - 1) : 0;
      pos[n.id].y = pad + i * sp;
    });
    itemN.sort(function(a, b) {
      var an = edges.filter(function(e) { return e[0] === a.id || e[1] === a.id; }).map(function(e) { return e[0] === a.id ? e[1] : e[0]; });
      var bn = edges.filter(function(e) { return e[0] === b.id || e[1] === b.id; }).map(function(e) { return e[0] === b.id ? e[1] : e[0]; });
      var aa = an.length ? an.reduce(function(s, id) { return s + (pos[id] ? pos[id].y : 0); }, 0) / an.length : pos[a.id].y;
      var ba = bn.length ? bn.reduce(function(s, id) { return s + (pos[id] ? pos[id].y : 0); }, 0) / bn.length : pos[b.id].y;
      return aa - ba;
    });
    itemN.forEach(function(n, i) {
      var sp = itemN.length > 1 ? (totalH - pad * 2) / (itemN.length - 1) : 0;
      pos[n.id].y = pad + i * sp;
    });
  }

  var minGap = 38;
  [itemN, factN].forEach(function(group) {
    var sorted = group.slice().sort(function(a, b) { return pos[a.id].y - pos[b.id].y; });
    for (var i = 1; i < sorted.length; i++) {
      var prev = pos[sorted[i - 1].id].y;
      if (pos[sorted[i].id].y - prev < minGap) {
        pos[sorted[i].id].y = prev + minGap;
      }
    }
    if (sorted.length > 0) {
      var lastY = pos[sorted[sorted.length - 1].id].y + 20;
      if (lastY > totalH) totalH = lastY;
    }
  });

  return { pos: pos, h: totalH };
}

var PHASE = { SETUP: "setup", DICE: "dice", PLAY: "play", BONUS: "bonus", END: "end" };
var FONT = "'DM Sans', 'Segoe UI', sans-serif";
var MONO = "'Space Mono', monospace";
var GRAD = "linear-gradient(135deg, #f0c27f, #fc5c7d)";
var PC = ["#fc5c7d", "#7ecbf5"];

var CSS = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');" +
  "* { box-sizing: border-box; margin: 0; padding: 0; }" +
  "html, body, #root { overflow-y: auto !important; height: auto !important; min-height: 100vh; background: #0a0e17; }" +
  "::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #151b2b; } ::-webkit-scrollbar-thumb { background: #2a3555; border-radius: 3px; }";

export default function ConceptLinksGame() {
  var _phase = useState(PHASE.SETUP); var phase = _phase[0]; var setPhase = _phase[1];
  var _items = useState(DEFAULT_ITEMS); var items = _items[0]; var setItems = _items[1];
  var _facts = useState(DEFAULT_FACTS); var facts = _facts[0]; var setFacts = _facts[1];
  var _links = useState(DEFAULT_LINKS); var links = _links[0]; var setLinks = _links[1];
  var _ei = useState(null); var editingItem = _ei[0]; var setEditingItem = _ei[1];
  var _ef = useState(null); var editingFact = _ef[0]; var setEditingFact = _ef[1];
  var _pn = useState(["Player 1","Player 2"]); var playerNames = _pn[0]; var setPlayerNames = _pn[1];
  var _ib = useState([]); var itemBag = _ib[0]; var setItemBag = _ib[1];
  var _fb = useState([]); var factBag = _fb[0]; var setFactBag = _fb[1];
  var _hands = useState([[],[]]); var hands = _hands[0]; var setHands = _hands[1];
  var _bn = useState([]); var boardNodes = _bn[0]; var setBoardNodes = _bn[1];
  var _be = useState([]); var boardEdges = _be[0]; var setBoardEdges = _be[1];
  var _cp = useState(0); var currentPlayer = _cp[0]; var setCurrentPlayer = _cp[1];
  var _sc = useState([0,0]); var scores = _sc[0]; var setScores = _sc[1];
  var _msg = useState(""); var message = _msg[0]; var setMessage = _msg[1];
  var _lm = useState({}); var linkMap = _lm[0]; var setLinkMap = _lm[1];
  var _cs = useState(0); var consecutiveSkips = _cs[0]; var setConsecutiveSkips = _cs[1];
  var _gp = useState({}); var graphPositions = _gp[0]; var setGraphPositions = _gp[1];
  var _gh = useState(200); var graphH = _gh[0]; var setGraphH = _gh[1];
  var _gl = useState([]); var gameLog = _gl[0]; var setGameLog = _gl[1];

  var _chain = useState([]); var chain = _chain[0]; var setChain = _chain[1];
  var _anchor = useState(null); var anchor = _anchor[0]; var setAnchor = _anchor[1];

  var _bonusDone = useState([false, false]); var bonusDone = _bonusDone[0]; var setBonusDone = _bonusDone[1];
  var _bonusSel = useState([]); var bonusSel = _bonusSel[0]; var setBonusSel = _bonusSel[1];

  var _showMap = useState(false); var showMap = _showMap[0]; var setShowMap = _showMap[1];

  var _dice = useState([null, null]); var dice = _dice[0]; var setDice = _dice[1];
  var _diceRolling = useState(false); var diceRolling = _diceRolling[0]; var setDiceRolling = _diceRolling[1];
  var _diceResult = useState(null); var diceResult = _diceResult[0]; var setDiceResult = _diceResult[1];

  var graphW = 700;
  var isFirstTurn = boardNodes.length === 0;
  var isBonus = phase === PHASE.BONUS;

  function tk(t) { return t.type === "item" ? "c" + t.index : "f" + t.index; }
  function tn(t) { return t.type === "item" ? items[t.index] : facts[t.index]; }

  function toggleLink(ci, fi) {
    var exists = links.some(function(p) { return p[0] === ci && p[1] === fi; });
    if (exists) {
      setLinks(links.filter(function(p) { return !(p[0] === ci && p[1] === fi); }));
    } else {
      setLinks(links.concat([[ci, fi]]));
    }
  }

  function doLayout(nodes, edges) {
    var r = layoutGraph(nodes, edges, graphW);
    setGraphPositions(r.pos); setGraphH(r.h);
  }

  function startGame() {
    var lm = buildLinkMap(links); setLinkMap(lm);
    var cB = shuffle(Array.from({ length: items.length }, function(_, i) { return i; }));
    var fB = shuffle(Array.from({ length: facts.length }, function(_, i) { return i; }));
    var h0 = cB.splice(0, 2).map(function(i) { return { type: "item", index: i }; }).concat(fB.splice(0, 2).map(function(i) { return { type: "fact", index: i }; }));
    var h1 = cB.splice(0, 2).map(function(i) { return { type: "item", index: i }; }).concat(fB.splice(0, 2).map(function(i) { return { type: "fact", index: i }; }));
    setItemBag(cB); setFactBag(fB); setHands([h0, h1]);
    setBoardNodes([]); setBoardEdges([]); setScores([0, 0]);
    setChain([]); setAnchor(null); setBonusDone([false, false]); setBonusSel([]);
    setConsecutiveSkips(0); setGraphPositions({}); setGraphH(200); setGameLog([]);
    setDice([null, null]); setDiceRolling(false); setDiceResult(null);
    setPhase(PHASE.DICE);
  }

  function rollDice() {
    setDiceRolling(true);
    setDiceResult(null);
    var rollCount = 0;
    var interval = setInterval(function() {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(interval);
        var d1 = Math.floor(Math.random() * 6) + 1;
        var d2 = Math.floor(Math.random() * 6) + 1;
        while (d1 === d2) {
          d1 = Math.floor(Math.random() * 6) + 1;
          d2 = Math.floor(Math.random() * 6) + 1;
        }
        setDice([d1, d2]);
        setDiceRolling(false);
        var winner = d1 > d2 ? 0 : 1;
        setDiceResult(winner);
      }
    }, 80);
  }

  function proceedFromDice() {
    setCurrentPlayer(diceResult);
    setMessage(playerNames[diceResult] + " goes first!");
    setGameLog([playerNames[diceResult] + " won the dice roll"]);
    setPhase(PHASE.PLAY);
  }

  function clickHandTile(idx) {
    var pos = chain.indexOf(idx);
    if (pos !== -1) {
      setChain(chain.slice(0, pos));
    } else {
      setChain(chain.concat([idx]));
    }
  }

  function clickBoardNode(nid) {
    if (isBonus) {
      if (bonusSel.includes(nid)) setBonusSel(bonusSel.filter(function(id) { return id !== nid; }));
      else setBonusSel(bonusSel.concat([nid]));
      return;
    }
    if (isFirstTurn) return;
    if (chain.length === 0) return;
    setAnchor(anchor === nid ? null : nid);
  }

  function getPlayValidity() {
    var hand = hands[currentPlayer];
    var tiles = chain.map(function(i) { return hand[i]; });
    if (!tiles.length) return { valid: false, reason: "Select tiles from your hand." };

    var bIds = new Set(boardNodes.map(function(n) { return n.id; }));
    var eSet = new Set();
    boardEdges.forEach(function(e) { eSet.add(e[0] + "-" + e[1]); eSet.add(e[1] + "-" + e[0]); });

    var keys = tiles.map(tk);
    for (var k = 0; k < keys.length; k++) {
      if (bIds.has(keys[k])) return { valid: false, reason: '"' + tn(tiles[k]) + '" is already on the board.' };
    }

    if (isFirstTurn) {
      if (tiles.length !== 2) return { valid: false, reason: "First turn: select 1 item and 1 fact." };
      var ct = tiles.find(function(t) { return t.type === "item"; });
      var ft = tiles.find(function(t) { return t.type === "fact"; });
      if (!ct || !ft) return { valid: false, reason: "Select 1 item and 1 fact." };
      var cK = "c" + ct.index, fK = "f" + ft.index;
      if (!linkMap[cK] || !linkMap[cK].has(fK)) return { valid: false, reason: "This item and fact are not linked." };
      return { valid: true, score: 10, connections: [[cK, fK]], newNodes: [cK, fK], tilesUsed: chain.slice() };
    }

    if (!anchor) return { valid: false, reason: "Select a board node to attach your chain to." };

    var anchorNode = boardNodes.find(function(n) { return n.id === anchor; });
    if (!anchorNode) return { valid: false, reason: "Invalid anchor." };

    var connections = [];
    var prev = anchor;
    for (var i = 0; i < keys.length; i++) {
      var cur = keys[i];
      var prevIsItem = prev.startsWith("c");
      var curIsItem = cur.startsWith("c");
      if (prevIsItem === curIsItem) {
        return { valid: false, reason: 'Tile #' + (i + 1) + ' "' + tn(tiles[i]) + '" is the same type as what it connects to. Alternate items and facts.' };
      }
      if (!linkMap[prev] || !linkMap[prev].has(cur)) {
        var prevLabel = i === 0 ? anchorNode.label : tn(tiles[i - 1]);
        return { valid: false, reason: 'No link between "' + prevLabel + '" and "' + tn(tiles[i]) + '".' };
      }
      if (eSet.has(prev + "-" + cur)) {
        return { valid: false, reason: "Connection already exists on the board." };
      }
      connections.push([prev, cur]);
      prev = cur;
    }

    var score = keys.length * 5 + connections.length * 5;
    return { valid: true, score: score, connections: connections, newNodes: keys, tilesUsed: chain.slice() };
  }

  function getBonusValidity() {
    if (bonusSel.length < 2) return { valid: false, reason: "Select 2+ board nodes to connect." };
    var eSet = new Set();
    boardEdges.forEach(function(e) { eSet.add(e[0] + "-" + e[1]); eSet.add(e[1] + "-" + e[0]); });
    var sel = bonusSel.map(function(id) { return boardNodes.find(function(n) { return n.id === id; }); }).filter(Boolean);
    var conn = [];
    for (var i = 0; i < sel.length; i++) {
      for (var j = i + 1; j < sel.length; j++) {
        if ((sel[i].type === "item") === (sel[j].type === "item")) continue;
        if (!linkMap[sel[i].id] || !linkMap[sel[i].id].has(sel[j].id)) continue;
        if (eSet.has(sel[i].id + "-" + sel[j].id)) continue;
        conn.push([sel[i].id, sel[j].id]);
      }
    }
    if (!conn.length) return { valid: false, reason: "No valid new connections among selected nodes." };
    return { valid: true, score: conn.length * 5, connections: conn };
  }

  var validity = (function() {
    if (isBonus) return bonusSel.length >= 2 ? getBonusValidity() : null;
    if (!chain.length) return null;
    if (isFirstTurn && chain.length === 2) return getPlayValidity();
    if (isFirstTurn && chain.length < 2) return null;
    if (!isFirstTurn) return getPlayValidity();
    return null;
  })();

  var canPlay = validity && validity.valid;

  function playTurn() {
    if (isBonus) {
      var r = getBonusValidity();
      if (!r.valid) { setMessage(r.reason); return; }
      var ne = boardEdges.concat(r.connections);
      doLayout(boardNodes, ne);
      var ns = scores.slice(); ns[currentPlayer] += r.score;
      setBoardEdges(ne); setScores(ns); setBonusSel([]);
      var bd = bonusDone.slice(); bd[currentPlayer] = true; setBonusDone(bd);
      setGameLog(gameLog.concat([playerNames[currentPlayer] + " bonus: +" + r.score]));
      var next = 1 - currentPlayer;
      if (bd[next]) {
        setPhase(PHASE.END); setMessage("Game over!"); return;
      }
      setCurrentPlayer(next); setMessage(playerNames[next] + "'s bonus turn.");
      return;
    }

    var r2 = getPlayValidity();
    if (!r2.valid) { setMessage(r2.reason); return; }
    var hand = hands[currentPlayer];
    var nBN = boardNodes.slice();
    r2.newNodes.forEach(function(id) {
      if (!nBN.find(function(n) { return n.id === id; })) {
        var isItem = id.startsWith("c");
        var idx = parseInt(id.slice(1));
        nBN.push({ id: id, type: isItem ? "item" : "fact", label: isItem ? items[idx] : facts[idx], playedBy: currentPlayer });
      }
    });
    var ne2 = boardEdges.concat(r2.connections);
    doLayout(nBN, ne2);
    var nh = hand.filter(function(_, i) { return !r2.tilesUsed.includes(i); });
    var cB = itemBag.slice(); var fB = factBag.slice();
    var played = r2.tilesUsed.map(function(i) { return hand[i]; });
    var iUsed = played.filter(function(t) { return t.type === "item"; }).length;
    var fUsed = played.filter(function(t) { return t.type === "fact"; }).length;
    for (var ii = 0; ii < iUsed && cB.length > 0; ii++) nh.push({ type: "item", index: cB.pop() });
    for (var fi = 0; fi < fUsed && fB.length > 0; fi++) nh.push({ type: "fact", index: fB.pop() });
    var nH = hands.slice(); nH[currentPlayer] = nh;
    var ns2 = scores.slice(); ns2[currentPlayer] += r2.score;
    var names = played.map(tn);

    setBoardNodes(nBN); setBoardEdges(ne2); setHands(nH); setItemBag(cB); setFactBag(fB);
    setScores(ns2); setChain([]); setAnchor(null); setConsecutiveSkips(0);
    setGameLog(gameLog.concat([playerNames[currentPlayer] + " played " + names.join(" > ") + " (+" + r2.score + ")"]));

    var next2 = 1 - currentPlayer;
    if (cB.length === 0 && fB.length === 0 && nH[0].length === 0 && nH[1].length === 0) { enterBonus(); return; }
    if (cB.length === 0 && fB.length === 0 && nH[next2].length === 0) { enterBonus(); return; }
    setCurrentPlayer(next2); setMessage(playerNames[next2] + "'s turn.");
  }

  function enterBonus() {
    setPhase(PHASE.BONUS); setCurrentPlayer(0); setBonusDone([false, false]); setBonusSel([]);
    setChain([]); setAnchor(null);
    setMessage("Bonus Round! Each player gets 1 turn.");
    setGameLog(function(g) { return g.concat(["--- Bonus Round ---"]); });
  }

  function skipTurn() {
    if (isBonus) {
      var bd = bonusDone.slice(); bd[currentPlayer] = true; setBonusDone(bd);
      setBonusSel([]);
      setGameLog(gameLog.concat([playerNames[currentPlayer] + " passed bonus"]));
      var next = 1 - currentPlayer;
      if (bd[next]) { setPhase(PHASE.END); setMessage("Game over!"); return; }
      setCurrentPlayer(next); setMessage(playerNames[next] + "'s bonus turn."); return;
    }
    var hand = hands[currentPlayer]; var cB = itemBag.slice(); var fB = factBag.slice();
    var sw = chain.slice();
    if (sw.length > 0) {
      sw.forEach(function(i) { var t = hand[i]; if (t.type === "item") cB.push(t.index); else fB.push(t.index); });
      var rem = hand.filter(function(_, i) { return !sw.includes(i); });
      var nc = shuffle(cB); var nf = shuffle(fB);
      var cr = sw.filter(function(j) { return hand[j].type === "item"; }).length;
      var fr = sw.filter(function(j) { return hand[j].type === "fact"; }).length;
      for (var i = 0; i < cr && nc.length > 0; i++) rem.push({ type: "item", index: nc.pop() });
      for (var j = 0; j < fr && nf.length > 0; j++) rem.push({ type: "fact", index: nf.pop() });
      var nH = hands.slice(); nH[currentPlayer] = rem; setHands(nH); setItemBag(nc); setFactBag(nf);
    }
    var ns = consecutiveSkips + 1; setConsecutiveSkips(ns);
    setChain([]); setAnchor(null);
    setGameLog(gameLog.concat([playerNames[currentPlayer] + " skipped"]));
    if (ns >= 2) { enterBonus(); return; }
    var next2 = 1 - currentPlayer; setCurrentPlayer(next2); setMessage(playerNames[next2] + "'s turn.");
  }

  var bonusHL = new Set();
  if (isBonus && bonusSel.length > 0) {
    boardEdges.forEach(function(e, i) {
      if (bonusSel.includes(e[0]) || bonusSel.includes(e[1])) bonusHL.add(i);
    });
  }

  // ===== SETUP =====
  if (phase === PHASE.SETUP) {
    return (
      <div style={{ fontFamily: FONT, background: "#0a0e17", color: "#e8e4dc", padding: "24px 24px 60px" }}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontFamily: MONO, fontSize: 28, marginBottom: 4, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Links with Friends</h1>
          <p style={{ color: "#8891a5", fontSize: 13, marginBottom: 24 }}>Define items, facts, and links between them.</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {playerNames.map(function(name, i) {
              return (
                <div key={i} style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#8891a5", textTransform: "uppercase", letterSpacing: 1 }}>Player {i + 1}</label>
                  <input value={name} onChange={function(e) { var n = playerNames.slice(); n[i] = e.target.value; setPlayerNames(n); }}
                    style={{ width: "100%", padding: "8px 12px", marginTop: 4, background: "#151b2b", border: "1px solid #2a3555", borderRadius: 6, color: "#e8e4dc", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontFamily: MONO, fontSize: 16, color: "#f0c27f" }}>Relationship Map</h2>
            <button onClick={function() { setShowMap(!showMap); }} style={{
              padding: "4px 14px", fontSize: 12, fontFamily: MONO, background: "transparent",
              color: "#f0c27f", border: "1px solid #f0c27f44", borderRadius: 6, cursor: "pointer"
            }}>
              {showMap ? "Hide" : "Reveal & Edit"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#8891a5", marginBottom: 12 }}>
            {showMap ? "Click cells to toggle links. Click names to edit." : items.length + " items, " + facts.length + " facts, " + links.length + " links defined."}
          </p>

          {showMap && (
            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr><th style={{ padding: 6, minWidth: 100 }} />
                  {facts.map(function(f, fi) {
                    return (
                      <th key={fi} style={{ padding: "4px 6px", writingMode: "vertical-lr", textAlign: "left", transform: "rotate(180deg)", maxHeight: 120, color: "#7ecbf5", cursor: "pointer", fontSize: 11 }} onClick={function() { setEditingFact(fi); }}>
                        {editingFact === fi
                          ? <input autoFocus value={f} onChange={function(e) { var ff = facts.slice(); ff[fi] = e.target.value; setFacts(ff); }} onBlur={function() { setEditingFact(null); }} onKeyDown={function(e) { if (e.key === "Enter") setEditingFact(null); }} onClick={function(e) { e.stopPropagation(); }}
                              style={{ width: 100, writingMode: "horizontal-tb", transform: "rotate(180deg)", background: "#1a2138", border: "1px solid #7ecbf5", borderRadius: 3, color: "#7ecbf5", padding: "2px 4px", fontSize: 11, fontFamily: "inherit" }} />
                          : f}
                      </th>
                    );
                  })}
                </tr></thead>
                <tbody>
                  {items.map(function(c, ci) {
                    return (
                      <tr key={ci}>
                        <td style={{ padding: "4px 8px", color: "#fc5c7d", fontWeight: 500, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }} onClick={function() { setEditingItem(ci); }}>
                          {editingItem === ci
                            ? <input autoFocus value={c} onChange={function(e) { var cc = items.slice(); cc[ci] = e.target.value; setItems(cc); }} onBlur={function() { setEditingItem(null); }} onKeyDown={function(e) { if (e.key === "Enter") setEditingItem(null); }} onClick={function(e) { e.stopPropagation(); }}
                                style={{ width: 100, background: "#1a2138", border: "1px solid #fc5c7d", borderRadius: 3, color: "#fc5c7d", padding: "2px 4px", fontSize: 11, fontFamily: "inherit" }} />
                            : c}
                        </td>
                        {facts.map(function(_, fi) {
                          var linked = links.some(function(p) { return p[0] === ci && p[1] === fi; });
                          return <td key={fi} onClick={function() { toggleLink(ci, fi); }} style={{ width: 28, height: 28, textAlign: "center", cursor: "pointer", background: linked ? "rgba(240,194,127,0.2)" : "#0d1220", border: "1px solid #1a2138", borderRadius: 2 }}>{linked && <span style={{ color: "#f0c27f", fontSize: 14 }}>&#x2022;</span>}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!showMap && <div style={{ marginBottom: 24 }} />}

          <button onClick={startGame} style={{ padding: "12px 32px", fontSize: 15, fontWeight: 700, fontFamily: MONO, background: GRAD, color: "#0a0e17", border: "none", borderRadius: 8, cursor: "pointer" }}>Start Game</button>
        </div>
      </div>
    );
  }

  // ===== DICE ROLL =====
  if (phase === PHASE.DICE) {
    var dieFaces = ["\u2680","\u2681","\u2682","\u2683","\u2684","\u2685"];
    return (
      <div style={{ fontFamily: FONT, background: "#0a0e17", color: "#e8e4dc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 24 }}>
        <style>{CSS}</style>
        <h1 style={{ fontFamily: MONO, fontSize: 28, marginBottom: 8, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Who goes first?</h1>
        <p style={{ color: "#8891a5", fontSize: 13, marginBottom: 32 }}>Roll the dice. Higher number starts.</p>

        <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
          {playerNames.map(function(name, i) {
            var isWinner = diceResult === i;
            var dieVal = dice[i];
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: PC[i], fontWeight: 600, marginBottom: 8 }}>{name}</div>
                <div style={{
                  width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
                  background: isWinner ? PC[i] + "22" : "#151b2b",
                  border: "2px solid " + (isWinner ? PC[i] : "#2a3555"),
                  borderRadius: 12, fontSize: 48,
                  color: dieVal ? (isWinner ? PC[i] : "#e8e4dc") : "#2a3555",
                  transition: "all 0.2s",
                }}>
                  {dieVal ? dieFaces[dieVal - 1] : "?"}
                </div>
                {dieVal && !diceRolling && (
                  <div style={{ fontSize: 20, fontFamily: MONO, fontWeight: 700, marginTop: 8, color: isWinner ? PC[i] : "#8891a5" }}>{dieVal}</div>
                )}
              </div>
            );
          })}
        </div>

        {diceResult !== null && !diceRolling && (
          <div style={{ fontSize: 16, color: "#f0c27f", marginBottom: 20, fontFamily: MONO }}>
            {playerNames[diceResult] + " goes first!"}
          </div>
        )}

        {diceResult === null && (
          <button onClick={rollDice} disabled={diceRolling} style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 700, fontFamily: MONO,
            background: diceRolling ? "#1a2138" : GRAD,
            color: diceRolling ? "#555" : "#0a0e17",
            border: "none", borderRadius: 8, cursor: diceRolling ? "default" : "pointer",
            opacity: diceRolling ? 0.6 : 1,
          }}>
            {diceRolling ? "Rolling..." : "Roll Dice"}
          </button>
        )}

        {diceResult !== null && !diceRolling && (
          <button onClick={proceedFromDice} style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 700, fontFamily: MONO,
            background: GRAD, color: "#0a0e17", border: "none", borderRadius: 8, cursor: "pointer",
          }}>
            Start Playing
          </button>
        )}
      </div>
    );
  }

  // ===== END =====
  if (phase === PHASE.END) {
    var w = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : -1;
    return (
      <div style={{ fontFamily: FONT, background: "#0a0e17", color: "#e8e4dc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 24 }}>
        <style>{CSS}</style>
        <h1 style={{ fontFamily: MONO, fontSize: 32, marginBottom: 16, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Game Over</h1>
        <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
          {playerNames.map(function(name, i) {
            return (
              <div key={i} style={{ textAlign: "center", padding: "20px 32px", background: w === i ? "rgba(240,194,127,0.15)" : "#151b2b", border: w === i ? "2px solid #f0c27f" : "1px solid #2a3555", borderRadius: 12 }}>
                <div style={{ fontSize: 14, color: "#8891a5", marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 36, fontFamily: MONO, fontWeight: 700, color: w === i ? "#f0c27f" : "#e8e4dc" }}>{scores[i]}</div>
                {w === i && <div style={{ fontSize: 12, color: "#f0c27f", marginTop: 4 }}>Winner!</div>}
              </div>
            );
          })}
        </div>
        {w === -1 && <div style={{ fontSize: 18, color: "#8891a5", marginBottom: 16 }}>It's a tie!</div>}
        <div style={{ marginBottom: 16, maxHeight: 200, overflowY: "auto", fontSize: 12, color: "#8891a5", width: "100%", maxWidth: 400 }}>
          {gameLog.map(function(e, i) { return <div key={i} style={{ color: e.includes("onus") ? "#f0c27f" : "#8891a5" }}>{e}</div>; })}
        </div>
        <button onClick={function() { setPhase(PHASE.SETUP); }} style={{ padding: "10px 24px", fontSize: 14, fontWeight: 700, fontFamily: MONO, background: GRAD, color: "#0a0e17", border: "none", borderRadius: 8, cursor: "pointer" }}>New Game</button>
      </div>
    );
  }

  // ===== PLAY / BONUS =====
  var hand = hands[currentPlayer];
  var inst = "";
  if (isBonus) {
    inst = bonusSel.length < 2 ? "Select 2+ board nodes with missing connections. You get 1 turn." : bonusSel.length + " nodes selected. Hit Play.";
  } else if (isFirstTurn) {
    inst = "Select 1 item and 1 fact from your hand (order doesn't matter).";
  } else if (chain.length === 0) {
    inst = "Click tiles in the order you want to chain them.";
  } else if (!anchor) {
    inst = "Chain: " + chain.length + " tile" + (chain.length > 1 ? "s" : "") + " selected. Now click a board node to attach to.";
  } else {
    inst = "Chain attached. Hit Play or adjust your selection.";
  }

  var chainPreview = "";
  if (chain.length > 0 && !isFirstTurn) {
    var anchorLabel = anchor ? (boardNodes.find(function(n) { return n.id === anchor; }) || {}).label || "?" : "?";
    var parts = [anchor ? anchorLabel : "[board]"];
    chain.forEach(function(idx) { parts.push(tn(hand[idx])); });
    chainPreview = parts.join(" > ");
  }

  return (
    <div style={{ fontFamily: FONT, background: "#0a0e17", color: "#e8e4dc", padding: "16px 16px 60px" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: MONO, fontSize: 20, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline" }}>Links with Friends</h1>
            {isBonus && <span style={{ marginLeft: 10, fontSize: 12, color: "#f0c27f", fontFamily: MONO, background: "rgba(240,194,127,0.15)", padding: "3px 10px", borderRadius: 4 }}>BONUS</span>}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            {playerNames.map(function(name, i) {
              return <div key={i} style={{ padding: "6px 14px", borderRadius: 6, background: currentPlayer === i ? PC[i] + "22" : "transparent", border: currentPlayer === i ? "2px solid " + PC[i] : "1px solid #2a3555", color: PC[i], fontWeight: currentPlayer === i ? 700 : 400 }}>{name}: {scores[i]}</div>;
            })}
          </div>
        </div>

        {!isBonus && (
          <div style={{ fontSize: 11, color: "#8891a5", marginBottom: 8, display: "flex", gap: 16 }}>
            <span>Item bag: {itemBag.length}</span><span>Fact bag: {factBag.length}</span>
          </div>
        )}

        <div style={{ padding: "8px 14px", marginBottom: 12, borderRadius: 6, background: "#151b2b", border: "1px solid #2a3555", fontSize: 13, color: "#c8c4bc" }}>
          <div>{message}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#8891a5", fontStyle: "italic" }}>{inst}</div>
        </div>

        {chainPreview && (
          <div style={{ padding: "6px 14px", marginBottom: 12, borderRadius: 6, background: "rgba(240,194,127,0.06)", border: "1px solid #f0c27f33", fontSize: 12, color: "#f0c27f", fontFamily: MONO }}>
            {chainPreview}
          </div>
        )}

        <div style={{ background: "#0d1220", border: "1px solid " + (isBonus ? "#f0c27f33" : "#1a2138"), borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
          {!boardNodes.length ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a3555", fontSize: 14, fontStyle: "italic" }}>Board is empty.</div>
          ) : (
            <svg width="100%" viewBox={"0 0 " + graphW + " " + graphH} style={{ display: "block" }}>
              {boardEdges.map(function(e, i) {
                var pa = graphPositions[e[0]], pb = graphPositions[e[1]];
                if (!pa || !pb) return null;
                var hl = bonusHL.has(i);
                return <line key={"e" + i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={hl ? "#f0c27f" : "#2a3555"} strokeWidth={hl ? 2.5 : 2} strokeOpacity={hl ? 0.9 : 0.7} />;
              })}
              {boardNodes.map(function(node) {
                var p = graphPositions[node.id];
                if (!p) return null;
                var isItem = node.type === "item";
                var base = isItem ? "#fc5c7d" : "#7ecbf5";
                var isSel = anchor === node.id || bonusSel.includes(node.id);
                var sc = isSel ? "#f0c27f" : base;
                var fc = isSel ? "#f0c27f" : "#151b2b";
                var tc = isSel ? "#0a0e17" : base;
                return (
                  <g key={node.id} onClick={function() { clickBoardNode(node.id); }} style={{ cursor: "pointer" }}>
                    <rect x={p.x - 60} y={p.y - 16} width={120} height={32} rx={8} fill={fc} stroke={sc} strokeWidth={isSel ? 2.5 : 1.5} />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fill={tc} fontSize={11} fontFamily="DM Sans, sans-serif" fontWeight={500}>
                      {node.label.length > 16 ? node.label.slice(0, 15) + "\u2026" : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {!isBonus && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#8891a5", marginBottom: 6, fontWeight: 500 }}>{playerNames[currentPlayer]}'s Hand</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {hand.map(function(tile, i) {
                var isItem = tile.type === "item";
                var color = isItem ? "#fc5c7d" : "#7ecbf5";
                var label = tn(tile);
                var chainPos = chain.indexOf(i);
                var sel = chainPos !== -1;
                var tK = tk(tile);
                var onB = boardNodes.some(function(n) { return n.id === tK; });
                return (
                  <div key={i} onClick={function() { if (!onB) clickHandTile(i); }}
                    style={{
                      padding: "8px 16px", borderRadius: 8, position: "relative",
                      background: sel ? color + "33" : onB ? "#0d1220" : "#151b2b",
                      border: "2px solid " + (sel ? color : onB ? "#1a2138" : "#2a3555"),
                      color: sel ? color : onB ? "#333" : "#8891a5",
                      fontSize: 13, cursor: onB ? "not-allowed" : "pointer",
                      fontWeight: sel ? 600 : 400, userSelect: "none",
                      opacity: onB ? 0.4 : 1,
                    }}>
                    {sel && (
                      <span style={{
                        position: "absolute", top: -8, right: -8,
                        width: 20, height: 20, borderRadius: 10,
                        background: color, color: "#0a0e17",
                        fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: MONO,
                      }}>
                        {chainPos + 1}
                      </span>
                    )}
                    <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 2, opacity: 0.7 }}>
                      {isItem ? "item" : "fact"}
                    </span>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {validity && (
          <div style={{
            padding: "8px 14px", marginBottom: 12, borderRadius: 6,
            background: validity.valid ? "rgba(120,200,120,0.1)" : "rgba(252,92,125,0.1)",
            border: "1px solid " + (validity.valid ? "#78c878" : "#fc5c7d"),
            fontSize: 12, color: validity.valid ? "#78c878" : "#fc5c7d",
          }}>
            {validity.valid
              ? "Valid! +" + validity.score + " pts (" + validity.connections.length + " connection" + (validity.connections.length > 1 ? "s" : "") + ")"
              : validity.reason}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={playTurn} disabled={!canPlay}
            style={{ padding: "10px 24px", fontSize: 14, fontWeight: 700, fontFamily: MONO, background: canPlay ? GRAD : "#1a2138", color: canPlay ? "#0a0e17" : "#555", border: "none", borderRadius: 8, cursor: canPlay ? "pointer" : "default", opacity: canPlay ? 1 : 0.5 }}>
            Play
          </button>
          <button onClick={skipTurn} style={{ padding: "10px 24px", fontSize: 14, fontWeight: 500, fontFamily: MONO, background: "transparent", color: "#8891a5", border: "1px solid #2a3555", borderRadius: 8, cursor: "pointer" }}>
            {isBonus ? "Pass" : "Skip / Swap"}
          </button>
          {(chain.length > 0 || anchor || bonusSel.length > 0) && (
            <button onClick={function() { setChain([]); setAnchor(null); setBonusSel([]); }}
              style={{ padding: "10px 24px", fontSize: 14, fontWeight: 500, fontFamily: MONO, background: "transparent", color: "#fc5c7d", border: "1px solid rgba(252,92,125,0.2)", borderRadius: 8, cursor: "pointer" }}>
              Clear
            </button>
          )}
          <button onClick={function() { setPhase(PHASE.SETUP); }}
            style={{ padding: "10px 24px", fontSize: 14, fontWeight: 500, fontFamily: MONO, background: "transparent", color: "#555", border: "1px solid #1a2138", borderRadius: 8, cursor: "pointer", marginLeft: "auto" }}>
            Quit
          </button>
        </div>

        {gameLog.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 11, maxHeight: 120, overflowY: "auto" }}>
            {gameLog.map(function(e, i) { return <div key={i} style={{ color: e.includes("onus") ? "#f0c27f" : "#555" }}>{e}</div>; })}
          </div>
        )}
      </div>
    </div>
  );
}
