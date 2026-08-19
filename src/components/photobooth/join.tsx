import React, { useState } from "react";
import { FlowNav, Icon } from "./common";

interface JoinProps {
  initialCode?: string;
  onExit: () => void;
  onJoinRoom: (name: string, code: string) => Promise<void>;
}

export function Join({ initialCode = "", onExit, onJoinRoom }: JoinProps) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const finalCode = code.trim().toUpperCase();
    const finalName = name.trim() || "Kamu";
    if (!finalCode) {
      setError("Please enter a room code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onJoinRoom(finalName, finalCode);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to join room. Please check code and try again.");
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
            <i></i> someone is waiting
          </span>
          <h1>
            Join them in the <em>same frame.</em>
          </h1>
          <p>Enter the private room code they shared with you. No account or download needed.</p>
        </section>
        <section className="card">
          <div className="field">
            <label htmlFor="code-input">Room code</label>
            <input
              id="code-input"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LOVE-7281"
              style={{ textTransform: "uppercase", letterSpacing: ".12em" }}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="name-input">Your name</label>
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

          {error && <div style={{ color: "#d83535", fontSize: "14px", marginBottom: "15px" }}>{error}</div>}

          <div className="form-footer">
            <button className="btn btn-dark" onClick={handleSubmit} disabled={loading}>
              {loading ? "Joining..." : <>Join photobooth <Icon name="arrow" /></>}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
