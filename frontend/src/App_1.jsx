import { useState, useRef, useEffect } from "react";

// ─── API CALL — routes through FastAPI backend (OpenAI key stays secure in .env)
const callClaude = async (messages) => {
  const response = await fetch("http://localhost:8000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json();
  const text = data.content || "";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      type: "redirect",
      message: "Let's keep our focus on Spark performance tuning.",
      question: "What do you already know about Apache Spark, even if it's just a little?"
    };
  }
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score >= 8) return "#4ade80";
  if (score >= 5) return "#facc15";
  return "#f87171";
};

const masteryColors = {
  beginner:   { bg: "#1e293b", text: "#94a3b8", label: "Beginner" },
  developing: { bg: "#1c2a3a", text: "#60a5fa", label: "Developing" },
  proficient: { bg: "#1a2e1a", text: "#4ade80", label: "Proficient" },
  mastery:    { bg: "#2a1a0e", text: "#fb923c", label: "Mastery ✦" },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 20, circ = 2 * Math.PI * r, filled = (score / 10) * circ;
  return (
    <svg width="56" height="56" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={scoreColor(score)} strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg) translate(0,-56px)", fill: scoreColor(score), fontSize: "13px", fontWeight: "700", fontFamily: "monospace" }}>
        {score}/10
      </text>
    </svg>
  );
};

const WelcomeCard = () => (
  <div style={{
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    border: "1px solid #312e81", borderRadius: "16px", padding: "28px", marginBottom: "8px",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: "-20px", right: "-20px", width: "160px", height: "160px",
      background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <div style={{ fontSize: "32px", marginBottom: "14px" }}>👋</div>
    <h2 style={{ color: "#c7d2fe", fontSize: "18px", fontWeight: "800", margin: "0 0 10px", letterSpacing: "0.5px" }}>
      Welcome to MasteryMind
    </h2>
    <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.8", margin: "0 0 20px" }}>
      I'm your Spark performance tuning tutor. Instead of me lecturing you,{" "}
      <strong style={{ color: "#e2e8f0" }}>you drive the learning</strong> — ask me anything about Spark
      and I'll teach it, then quiz you to build real understanding.
    </p>
    <div style={{
      background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
      borderRadius: "10px", padding: "14px 16px",
    }}>
      <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "10px" }}>
        💡 TRY ASKING
      </div>
      {[
        "What is Apache Spark?",
        "How does Spark decide how to run a job?",
        "What is a shuffle and why is it slow?",
      ].map((q, i) => (
        <div key={i} style={{ color: "#a5b4fc", fontSize: "13px", marginBottom: i < 2 ? "6px" : "0", fontStyle: "italic" }}>
          "{q}"
        </div>
      ))}
    </div>
  </div>
);

const TeachCard = ({ data }) => (
  <div style={{
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    border: "1px solid #312e81", borderRadius: "16px", padding: "24px", marginBottom: "8px",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
      background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <span style={{ fontSize: "16px" }}>⚡</span>
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", color: "#818cf8", textTransform: "uppercase" }}>
        {data.concept}
      </span>
    </div>
    <p style={{ color: "#e2e8f0", fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px", fontFamily: "'Georgia', serif" }}>
      {data.explanation}
    </p>
    <div style={{ background: "rgba(99,102,241,0.1)", borderLeft: "3px solid #6366f1", padding: "14px 16px", borderRadius: "0 8px 8px 0" }}>
      <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "6px" }}>
        CHECK YOUR UNDERSTANDING
      </div>
      <p style={{ color: "#c7d2fe", margin: 0, fontSize: "15px", fontWeight: "500" }}>{data.question}</p>
    </div>
  </div>
);

const RemediationCard = ({ questions }) => (
  <div style={{
    background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "16px", padding: "20px", marginBottom: "8px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
      <span style={{ fontSize: "16px" }}>🔁</span>
      <span style={{ fontSize: "11px", fontWeight: "700", color: "#fbbf24", letterSpacing: "1.5px" }}>
        LET'S BUILD THE FOUNDATION FIRST
      </span>
    </div>
    <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "14px", lineHeight: "1.6" }}>
      No worries — let's back up and make sure the basics are solid. Work through these 3 questions one by one:
    </p>
    {questions.map((q, i) => (
      <div key={i} style={{
        background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)",
        borderRadius: "8px", padding: "12px 14px", marginBottom: "8px",
        display: "flex", gap: "10px", alignItems: "flex-start",
      }}>
        <span style={{ color: "#fbbf24", fontWeight: "800", fontSize: "13px", flexShrink: 0 }}>{i + 1}.</span>
        <span style={{ color: "#fde68a", fontSize: "14px", lineHeight: "1.6" }}>{q}</span>
      </div>
    ))}
  </div>
);

const EvalCard = ({ data }) => {
  const m = masteryColors[data.mastery_level] || masteryColors.beginner;
  return (
    <div style={{
      background: "#0f172a", border: `1px solid ${scoreColor(data.score)}33`,
      borderRadius: "16px", padding: "24px", marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", marginBottom: "6px" }}>
            {data.correct ? "✅ Correct!" : "🔄 Not quite — let's refine this"}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: m.bg, border: `1px solid ${m.text}44`, padding: "3px 10px", borderRadius: "20px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.text, display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: "700", color: m.text, letterSpacing: "1px" }}>{m.label}</span>
          </div>
        </div>
        <ScoreRing score={data.score} />
      </div>

      {data.misconceptions?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", color: "#f87171", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>
            ⚠ MISCONCEPTIONS DETECTED
          </div>
          {data.misconceptions.map((mis, i) => (
            <div key={i} style={{
              background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "6px", color: "#fca5a5", fontSize: "13px",
            }}>• {mis}</div>
          ))}
        </div>
      )}

      <div style={{
        background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "8px", padding: "14px", marginBottom: "14px",
      }}>
        <div style={{ fontSize: "10px", color: "#4ade80", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "8px" }}>
          CORRECTED UNDERSTANDING
        </div>
        <p style={{ color: "#bbf7d0", margin: 0, fontSize: "14px", lineHeight: "1.7" }}>{data.corrected_explanation}</p>
      </div>

      <div style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic", marginBottom: "16px" }}>
        {data.encouragement}
      </div>

      {!data.needs_remediation && (
        <div style={{ background: "rgba(99,102,241,0.08)", borderLeft: "3px solid #6366f1", padding: "14px 16px", borderRadius: "0 8px 8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: "700", letterSpacing: "1.5px" }}>NEXT QUESTION</div>
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "700", letterSpacing: "1px",
              background: data.next_difficulty === "harder" ? "rgba(251,146,60,0.15)" : data.next_difficulty === "easier" ? "rgba(96,165,250,0.15)" : "rgba(148,163,184,0.15)",
              color: data.next_difficulty === "harder" ? "#fb923c" : data.next_difficulty === "easier" ? "#60a5fa" : "#94a3b8",
            }}>
              {data.next_difficulty?.toUpperCase()}
            </span>
          </div>
          <p style={{ color: "#c7d2fe", margin: 0, fontSize: "15px", fontWeight: "500" }}>{data.next_question}</p>
        </div>
      )}
    </div>
  );
};

const RedirectCard = ({ data }) => (
  <div style={{
    background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "16px", padding: "20px", marginBottom: "8px",
  }}>
    <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "14px" }}>🧭 {data.message}</div>
    <div style={{ background: "rgba(99,102,241,0.08)", borderLeft: "3px solid #6366f1", padding: "14px 16px", borderRadius: "0 8px 8px 0" }}>
      <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "6px" }}>LET'S START HERE</div>
      <p style={{ color: "#c7d2fe", margin: 0, fontSize: "15px", fontWeight: "500" }}>{data.question}</p>
    </div>
  </div>
);

const UserBubble = ({ text }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
    <div style={{
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
      borderRadius: "16px 16px 4px 16px", padding: "12px 18px",
      maxWidth: "70%", fontSize: "14px", lineHeight: "1.6",
    }}>{text}</div>
  </div>
);

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: "8px", height: "8px", borderRadius: "50%", background: "#4f46e5",
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
    <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AITutorMVP() {
  const [messages, setMessages] = useState([]);
  const [cards, setCards] = useState([{ id: 0, type: "welcome" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionScore, setSessionScore] = useState({ total: 0, count: 0 });
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cards, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    if (!started) setStarted(true);

    setCards(c => [...c, { id: Date.now(), type: "user", text: userText }]);
    setLoading(true);

    const newMessages = [...messages, { role: "user", content: userText }];
    const resp = await callClaude(newMessages);
    const updatedMessages = [...newMessages, { role: "assistant", content: JSON.stringify(resp) }];
    setMessages(updatedMessages);

    const newCards = [];

    if (resp.type === "teach") {
      newCards.push({ id: Date.now() + 1, type: "teach", data: resp });
    } else if (resp.type === "evaluation") {
      setSessionScore(s => ({ total: s.total + resp.score, count: s.count + 1 }));
      newCards.push({ id: Date.now() + 1, type: "eval", data: resp });
      if (resp.needs_remediation && resp.remediation_questions?.length > 0) {
        newCards.push({ id: Date.now() + 2, type: "remediation", questions: resp.remediation_questions });
      }
    } else if (resp.type === "redirect") {
      newCards.push({ id: Date.now() + 1, type: "redirect", data: resp });
    } else {
      // Catch-all — never block, always keep conversation alive
      newCards.push({ id: Date.now() + 1, type: "redirect", data: {
        message: "Let me redirect us back to Spark.",
        question: "What aspect of Spark performance would you like to explore first?"
      }});
    }

    setCards(c => [...c, ...newCards]);
    setLoading(false);
  };

  const avgScore = sessionScore.count > 0 ? (sessionScore.total / sessionScore.count).toFixed(1) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "'IBM Plex Mono','Courier New',monospace", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{
        background: "rgba(15,23,42,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1e293b", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", boxShadow: "0 0 18px rgba(99,102,241,0.4)",
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "15px", letterSpacing: "1px", color: "#fff" }}>MasteryMind</div>
            <div style={{ fontSize: "9px", color: "#6366f1", letterSpacing: "2px" }}>SPARK PERFORMANCE TUNING</div>
          </div>
        </div>
        {sessionScore.count > 0 && (
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "17px", fontWeight: "800", color: scoreColor(parseFloat(avgScore)) }}>{avgScore}</div>
              <div style={{ fontSize: "9px", color: "#64748b", letterSpacing: "1px" }}>AVG SCORE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "#818cf8" }}>{sessionScore.count}</div>
              <div style={{ fontSize: "9px", color: "#64748b", letterSpacing: "1px" }}>ANSWERED</div>
            </div>
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: "760px", margin: "0 auto", width: "100%" }}>
        {cards.map(card => (
          <div key={card.id}>
            {card.type === "welcome"     && <WelcomeCard />}
            {card.type === "teach"       && <TeachCard data={card.data} />}
            {card.type === "eval"        && <EvalCard data={card.data} />}
            {card.type === "remediation" && <RemediationCard questions={card.questions} />}
            {card.type === "redirect"    && <RedirectCard data={card.data} />}
            {card.type === "user"        && <UserBubble text={card.text} />}
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR — always enabled */}
      <div style={{
        background: "rgba(15,23,42,0.98)", borderTop: "1px solid #1e293b",
        padding: "16px 24px", position: "sticky", bottom: 0,
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "12px" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={!started ? "Ask your first question about Spark…" : "Type your answer or ask a new question…"}
            disabled={loading}
            rows={1}
            style={{
              flex: 1, background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: "12px", padding: "14px 16px", color: "#e2e8f0",
              fontSize: "14px", resize: "none", fontFamily: "inherit",
              outline: "none", minHeight: "52px", maxHeight: "120px",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#4f46e5"}
            onBlur={e => e.target.style.borderColor = "#1e293b"}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#1e293b" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: loading || !input.trim() ? "#475569" : "#fff",
              border: "none", borderRadius: "12px", padding: "14px 22px",
              fontSize: "14px", fontWeight: "700", letterSpacing: "0.5px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >{loading ? "…" : "SEND →"}</button>
        </div>
      </div>
    </div>
  );
}
