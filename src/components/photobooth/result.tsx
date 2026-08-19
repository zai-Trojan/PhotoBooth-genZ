import React, { useState } from "react";
import { Brand, Icon } from "./common";

interface ResultProps {
  name: string;
  roomCode: string;
  compositeUrl: string;
  onRetake: () => void;
}

export function Result({ name, roomCode, compositeUrl, onRetake }: ResultProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2200);
  };

  const handleDownload = async () => {
    try {
      showNotice("Downloading photostrip...");
      const res = await fetch(compositeUrl);
      const blob = await res.json().catch(() => null) || await res.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `togetherbooth-${roomCode}.jpg`;
      a.href = blobUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open in new tab
      window.open(compositeUrl, "_blank");
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.origin + `?room=${roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Our TogetherBooth",
        text: "Even miles apart, we’re still in the same frame.",
        url: shareUrl,
      });
    } else {
      navigator.clipboard?.writeText(shareUrl);
      showNotice("Share link copied to clipboard!");
    }
  };

  return (
    <main className="result-page">
      {/* Navigation */}
      <div className="shell nav">
        <Brand />
        <div className="nav-links">
          <button className="btn btn-dark btn-sm" onClick={onRetake}>
            New booth <Icon name="arrow" />
          </button>
        </div>
      </div>

      <div className="shell result-layout">
        {/* Confetti and Strip Frame */}
        <section className="strip-wrap">
          <b className="confetti c1">✦</b>
          <b className="confetti c2">♡</b>
          <b className="confetti c3">✦</b>
          <div className="strip-container" style={{ maxWidth: "340px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", borderRadius: "8px", overflow: "hidden" }}>
            <img 
              src={compositeUrl} 
              alt="TogetherBooth Photostrip" 
              style={{ width: "100%", display: "block" }} 
            />
          </div>
        </section>

        {/* Copy / Action area */}
        <section className="result-copy">
          <span className="eyebrow">
            <i></i> your photos are ready
          </span>
          <h1>
            A little piece of <em>us.</em>
          </h1>
          <p>
            Four moments, one frame, and no distance in sight. Save it somewhere special—or send it to someone who'll
            smile.
          </p>
          <div className="result-actions">
            <button className="btn btn-dark" onClick={handleDownload}>
              <Icon name="download" /> Download photostrip
            </button>
            <button className="btn btn-light" onClick={handleShare}>
              <Icon name="link" /> Share
            </button>
            <button className="btn btn-ghost" onClick={onRetake}>
              <Icon name="rotate" /> Retake
            </button>
          </div>
          <div className="result-info">
            <span>Private by default</span>
            <span>Room expires in 24:00</span>
          </div>
        </section>
      </div>

      {notice && (
        <div className="notice show" id="notice">
          {notice}
        </div>
      )}
    </main>
  );
}
