import React, { useState } from "react";
import { Brand, Icon, ThemeCharacterArt, drawImageCover } from "./common";

interface ResultProps {
  name: string;
  userId: string;
  roomCode: string;
  uploads: Record<string, string[]>;
  role: "HOST" | "GUEST";
  mode?: "solo" | "couple";
  onRetake: () => void;
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

const FRAME_COLORS: Record<string, string> = {
  pink: "#edabb0",
  black: "#292724",
  cream: "#e9ddc8",
  sage: "#aebc98",
  blue: "#aabecd",
  toystory: "#39a8df",
  avengers: "#152f55",
  spiderman: "#c8212c",
};

export function Result({ name, userId, roomCode, uploads, role, mode = "couple", onRetake }: ResultProps) {
  const [selectedFrame, setSelectedFrame] = useState("pink");
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2200);
  };

  const isSolo = mode === "solo";
  const otherId = isSolo ? "" : (Object.keys(uploads).find((id) => id !== userId) || "Guest");
  
  const isHost = role === "HOST";
  const hostId = isSolo ? userId : (isHost ? userId : otherId);
  const guestId = isSolo ? "" : (isHost ? otherId : userId);

  const hostImages = uploads[hostId] || [];
  const guestImages = guestId ? (uploads[guestId] || []) : [];

  const handleDownload = async () => {
    try {
      showNotice("Generating photostrip...");
      const canvas = document.createElement("canvas");
      canvas.width = isSolo ? 480 : 900;
      canvas.height = 1960;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      const cx = isSolo ? 240 : 450;

      // Draw background
      ctx.fillStyle = FRAME_COLORS[selectedFrame] || "#edabb0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frame specific graphics
      drawFrameTheme(ctx, selectedFrame, canvas.width, canvas.height);

      // Draw header title
      ctx.fillStyle = ["black", "avengers", "spiderman"].includes(selectedFrame) ? "white" : "#282621";
      ctx.textAlign = "center";
      ctx.font = "italic 58px Georgia";
      ctx.fillText(isSolo ? "me, myself & I ♡" : "us, from anywhere ♡", cx, 85);

      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      // Load all images
      const loadedHost: HTMLImageElement[] = [];
      const loadedGuest: HTMLImageElement[] = [];
      for (let i = 0; i < 4; i++) {
        if (hostImages[i]) loadedHost[i] = await loadImage(hostImages[i]);
        if (guestImages[i]) loadedGuest[i] = await loadImage(guestImages[i]);
      }

      // Draw images
      for (let i = 0; i < 4; i++) {
        const y = 125 + i * 420;
        if (loadedHost[i]) {
          drawImageCover(ctx, loadedHost[i], 35, y, 410, 360);
        }
        if (!isSolo && loadedGuest[i]) {
          // Mirror guest image symmetrically
          drawImageCover(ctx, loadedGuest[i], 455, y, 410, 360, true);
        }
      }

      // Draw cute characters at the bottom
      await drawCuteCharacters(ctx, selectedFrame, cx, 1810);

      // Load and draw NEAMOR logo at the bottom
      try {
        const logoImg = await loadImage("/logo.png");
        ctx.drawImage(logoImg, cx - 25, 1815, 50, 50);
      } catch (e) {
        console.warn("Failed to load logo for canvas", e);
      }

      // Draw footer date
      ctx.fillStyle = ["black", "avengers", "spiderman"].includes(selectedFrame) ? "white" : "#282621";
      ctx.font = "28px Arial";
      ctx.fillText(`${new Date().toLocaleDateString("en-GB")} · NEAMOR`, cx, 1905);

      // Trigger download
      const link = document.createElement("a");
      link.download = `neamor-${roomCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showNotice("Photostrip downloaded!");
    } catch (err) {
      console.error(err);
      showNotice("Failed to generate download");
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.origin + `?room=${roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Our NEAMOR",
        text: "Miles apart. Memories together.",
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
        {/* Dynamic HTML/CSS Strip Preview */}
        <section className="strip-wrap">
          <b className="confetti c1">✦</b>
          <b className="confetti c2">♡</b>
          <b className="confetti c3">✦</b>
          <div className={`strip f-${selectedFrame}`} id="strip" style={{ width: isSolo ? "220px" : "305px", padding: "13px 13px 25px", backgroundColor: FRAME_COLORS[selectedFrame] || "#edabb0" }}>
            <div className="strip-title" style={{ fontSize: isSolo ? "16px" : "20px", fontFamily: "Georgia, serif", fontStyle: "italic", textAlign: "center", marginBottom: "10px" }}>
              {isSolo ? "me, myself & I ♡" : "us, from anywhere ♡"}
            </div>
            
            {/* Render 4 Photos rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="strip-photo" style={{ display: "flex", justifyContent: "center", marginBottom: "8px", height: "auto", backgroundColor: "transparent" }}>
                <div className="strip-pane" style={{ width: isSolo ? "194px" : "138px", height: isSolo ? "145px" : "103px", backgroundColor: "transparent", overflow: "hidden", position: "relative" }}>
                  {hostImages[i] ? (
                    <img 
                      src={hostImages[i]} 
                      alt="Local capture" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <div className="demo-face"></div>
                  )}
                </div>
                {!isSolo && (
                  <div className="strip-pane" style={{ width: "138px", height: "103px", backgroundColor: "transparent", overflow: "hidden", position: "relative", marginLeft: "6px" }}>
                    {guestImages[i] ? (
                      <img 
                        src={guestImages[i]} 
                        alt="Remote capture" 
                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} 
                      />
                    ) : (
                      <div className="demo-face"></div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <ThemeCharacterArt theme={selectedFrame} large={true} />

            <div className="strip-footer" style={{ textAlign: "center", fontSize: "10px", marginTop: "15px", opacity: 0.8 }}>
              {new Date().toLocaleDateString("en-GB")} · NEAMOR
            </div>
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
            Four moments, one frame, and no distance in sight. Choose your favorite frame below, then save and share it!
          </p>

          {/* Interactive Frame Selection */}
          <div className="field" style={{ marginTop: "20px", marginBottom: "25px" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "10px" }}>Choose a Frame Theme</label>
            <div className="frames" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {FRAMES.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  className={`frame-choice ${selectedFrame === f.slug ? "active" : ""}`}
                  onClick={() => setSelectedFrame(f.slug)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", border: "none", background: "none" }}
                >
                  <div className={`frame-mini f-${f.slug}`} data-badge={f.badge} style={{ width: "45px", height: "60px", borderRadius: "4px", position: "relative" }}>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <span style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

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
            <span>Local rendering & dynamic styles</span>
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

function drawCuteCharacters(x: CanvasRenderingContext2D, theme: string, cx: number, y: number): Promise<void> {
  const markup = themeCharacterArtMarkup(theme);
  if (!markup) return Promise.resolve();
  const holder = document.createElement("div");
  holder.innerHTML = markup;
  const svg = holder.querySelector("svg");
  if (!svg) return Promise.resolve();
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      x.drawImage(image, cx - 145, y - 72, 290, 145);
      resolve();
    };
    image.onerror = () => resolve();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`;
  });
}

function drawFrameTheme(x: CanvasRenderingContext2D, theme: string, w: number, h: number) {
  if (theme === "toystory") {
    x.fillStyle = "#fff";
    for (let i = 0; i < 16; i++) {
      x.beginPath();
      x.arc((i * 137) % w, (i * 239) % h, 22 + (i % 3) * 9, 0, Math.PI * 2);
      x.fill();
    }
    x.fillStyle = "#f5d13d";
    x.fillRect(0, h - 105, w, 105);
  }
  if (theme === "avengers") {
    x.strokeStyle = "rgba(120,198,255,.35)";
    x.lineWidth = 5;
    for (let r = 100; r < 600; r += 95) {
      x.beginPath();
      x.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      x.stroke();
    }
    x.fillStyle = "#cf2c3a";
    x.fillRect(0, h - 105, w, 105);
  }
  if (theme === "spiderman") {
    x.strokeStyle = "rgba(255,255,255,.42)";
    x.lineWidth = 4;
    for (let i = 0; i <= w; i += 90) {
      x.beginPath();
      x.moveTo(w / 2, 0);
      x.lineTo(i, h);
      x.stroke();
    }
    for (let r = 130; r < 1000; r += 110) {
      x.beginPath();
      x.arc(w / 2, 0, r, 0, Math.PI);
      x.stroke();
    }
    x.fillStyle = "#1262a3";
    x.fillRect(0, h - 105, w, 105);
  }
}

function themeCharacterArtMarkup(theme: string) {
  if (theme === "toystory") return `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><path fill="#8a542f" d="M15 28h66v10H15z"/><path fill="#9c6338" d="M27 11h42l7 20H20z"/><circle fill="#f2bd8c" cx="48" cy="43" r="20"/><circle fill="#29231f" cx="41" cy="43" r="2.5"/><circle fill="#29231f" cx="55" cy="43" r="2.5"/><path fill="none" stroke="#9d4f4a" stroke-width="2" d="M41 51q7 6 14 0"/><path fill="#f0bd27" d="M25 61q23-14 46 0v24H25z"/><path fill="#d73535" d="m38 59 10 10 10-10-10-6z"/><circle fill="#fff" cx="65" cy="69" r="6"/><path fill="#d5a62c" d="m65 64 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/></g><g><path fill="#7f4bac" d="M115 25q20-22 40 0l-5 13h-30z"/><circle fill="#e9b78d" cx="135" cy="43" r="19"/><circle fill="#29231f" cx="128" cy="43" r="2.5"/><circle fill="#29231f" cx="142" cy="43" r="2.5"/><path fill="#fff" d="M109 61q26-16 52 0v24h-52z"/><path fill="#77bd43" d="m109 64 17-8 9 14 9-14 17 8v21h-52z"/><path fill="#68439a" d="M128 68h14v9h-14z"/><path fill="#d64745" d="M132 71h4v4h-4z"/><path fill="#d9e5ed" d="m110 64-13-10v26l13-5zM160 64l13-10v26l-13-5z"/></g></svg>`;
  if (theme === "avengers") return `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><circle fill="#c52c32" cx="48" cy="40" r="25"/><path fill="#e4a44a" d="M33 22h30l6 18-10 17H37L27 40z"/><path fill="#f4d18b" d="M37 34h22v16H37z"/><path fill="#dcefff" d="m37 37 8 2-8 5zM59 37l-8 2 8 5z"/><path fill="#ad2029" d="M23 62q25-15 50 0v23H23z"/><path fill="#f0b944" d="M42 61h12l-6 13z"/><circle fill="#8fe4ff" cx="48" cy="70" r="5"/></g><g><circle fill="#235496" cx="135" cy="40" r="25"/><path fill="#fff" d="m135 16 5 11h-10z"/><path fill="#f0bd91" d="M119 34h32v22h-32z"/><path fill="#235496" d="M115 26h40v15l-9-9-11 8-11-8-9 9z"/><circle fill="#2a2522" cx="128" cy="43" r="2.5"/><circle fill="#2a2522" cx="142" cy="43" r="2.5"/><path fill="#214d87" d="M110 63q25-16 50 0v22h-50z"/><circle fill="#d82e38" cx="158" cy="67" r="17"/><circle fill="#fff" cx="158" cy="67" r="12"/><circle fill="#2860a4" cx="158" cy="67" r="7"/><path fill="#fff" d="m158 61 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/></g></svg>`;
  if (theme === "spiderman") return `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><circle fill="#cf2530" cx="48" cy="41" r="25"/><path fill="#fff" stroke="#202020" stroke-width="2" d="m30 34 14 5-10 10zM66 34l-14 5 10 10z"/><g fill="none" stroke="#2d2927" stroke-width="1.4"><path d="M48 16v50M25 27l46 28M71 27L25 55"/><path d="M31 22q17 15 34 0M25 40q23 13 46 0"/></g><path fill="#be1e28" d="M22 64q26-17 52 0v21H22z"/><path fill="#1d4777" d="M22 72h52v13H22z"/><path fill="#202020" d="m48 63 4 7-4 8-4-8z"/></g><g><circle fill="#17191d" cx="135" cy="41" r="25"/><path fill="#f5f5f5" stroke="#d82232" stroke-width="3" d="m116 33 15 6-11 11zM154 33l-15 6 11 11z"/><path fill="#16181c" d="M109 64q26-17 52 0v21h-52z"/><path fill="#d72332" d="M109 70h52v6h-52z"/><path fill="#d72332" d="m135 62 5 8-5 10-5-10z"/><g fill="none" stroke="#d72332" stroke-width="1.4"><path d="M135 16v49M115 26l40 29M155 26l-40 29"/></g></g></svg>`;
  return "";
}
