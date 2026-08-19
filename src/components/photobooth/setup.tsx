import React, { useState } from "react";
import { FlowNav, Icon, ThemeCharacterArt } from "./common";

interface SetupProps {
  initialName: string;
  onExit: () => void;
  onCreateRoom: (name: string) => Promise<void>;
}

export function Setup({ initialName, onExit, onCreateRoom }: SetupProps) {
  const [name, setName] = useState(initialName === "Kamu" ? "" : initialName);
  const [boothType, setBoothType] = useState<"special" | "bestie">("special");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const finalName = name.trim() || "Kamu";
    setLoading(true);
    setError(null);
    try {
      await onCreateRoom(finalName);
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
          <p>Choose a name and set up your private booth. You can choose a cute frame theme at the end of the photo shoot!</p>
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
