import React, { useState } from "react";
import { FlowNav, Icon, ThemeCharacterArt } from "./common";

interface SetupProps {
  initialName: string;
  onExit: () => void;
  onCreateRoom: (name: string, frame: string) => Promise<void>;
}

const FRAMES = [
  { slug: "pink", name: "Blush", badge: "" },
  { slug: "black", name: "Classic", badge: "" },
  { slug: "cream", name: "Vanilla", badge: "" },
  { slug: "sage", name: "Sage", badge: "" },
  { slug: "blue", name: "Cloud", badge: "" },
  { slug: "toystory", name: "Toy Story", badge: "★" },
  { slug: "avengers", name: "Avengers", badge: "A" },
  { slug: "spiderman", name: "Spider-Man", badge: "🕸" },
];

export function Setup({ initialName, onExit, onCreateRoom }: SetupProps) {
  const [name, setName] = useState(initialName === "Kamu" ? "" : initialName);
  const [selectedFrame, setSelectedFrame] = useState("pink");
  const [boothType, setBoothType] = useState<"special" | "bestie">("special");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const finalName = name.trim() || "Kamu";
    setLoading(true);
    setError(null);
    try {
      await onCreateRoom(finalName, selectedFrame);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flow-page">
      <FlowNav step={1} onExit={onExit} />
      <div className="flow-wrap setup-grid">
        <section className="setup-copy">
          <span className="eyebrow">
            <i></i> create your room
          </span>
          <h1>
            Make it feel like <em>yours.</em>
          </h1>
          <p>Choose a name and your favorite frame. You can change everything again before the photos begin.</p>
        </section>
        <section className="card">
          <div className="field">
            <label htmlFor="name-input">What should we call you?</label>
            <input
              id="name-input"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Who's this booth for?</label>
            <div className="choice-row">
              <button
                type="button"
                className={`choice ${boothType === "special" ? "active" : ""}`}
                onClick={() => setBoothType("special")}
                disabled={loading}
              >
                <b>♡ Someone special</b>
                <small>A date, anniversary, or just because</small>
              </button>
              <button
                type="button"
                className={`choice ${boothType === "bestie" ? "active" : ""}`}
                onClick={() => setBoothType("bestie")}
                disabled={loading}
              >
                <b>☺ My bestie</b>
                <small>Long-distance friendship memories</small>
              </button>
            </div>
          </div>

          <div className="field">
            <label>Choose a frame</label>
            <div className="frames">
              {FRAMES.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  className={`frame-choice ${selectedFrame === f.slug ? "active" : ""}`}
                  onClick={() => setSelectedFrame(f.slug)}
                  disabled={loading}
                >
                  <div className={`frame-mini f-${f.slug}`} data-badge={f.badge}>
                    <i></i>
                    <i></i>
                    <i></i>
                    <ThemeCharacterArt theme={f.slug} />
                  </div>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ color: "#d83535", fontSize: "14px", marginBottom: "15px" }}>{error}</div>}

          <div className="form-footer">
            <button className="btn btn-dark" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : <>Create room <Icon name="arrow" /></>}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
