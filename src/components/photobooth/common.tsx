import React from "react";

export const ICONS = {
  arrow: "→",
  camera: "◉",
  copy: "⧉",
  link: "↗",
  check: "✓",
  download: "↓",
  rotate: "↻",
  users: "♧",
  heart: "♥",
  magic: "✦",
};

export function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return <span className={className}>{ICONS[name] || name}</span>;
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <div className="brand" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <span className="brand-mark">tb</span>
      <span>togetherbooth</span>
    </div>
  );
}

export function FlowNav({ step, onExit }: { step: number; onExit: () => void }) {
  return (
    <div className="flow-wrap flow-nav">
      <Brand onClick={onExit} />
      <div className="progress">
        <b>Set up</b>
        <i className={`progress-line ${step > 1 ? "on" : ""}`}></i>
        <span>Invite</span>
        <i className={`progress-line ${step > 2 ? "on" : ""}`}></i>
        <span>Photos</span>
        <i className={`progress-line ${step > 3 ? "on" : ""}`}></i>
        <span>Done</span>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onExit}>
        Exit
      </button>
    </div>
  );
}

export function ThemeCharacterArt({ theme, large = false }: { theme: string; large?: boolean }) {
  const cls = `theme-characters ${large ? "large" : ""}`;
  if (theme === "toystory") {
    return (
      <div className={cls} aria-label="Cute cowboy and space ranger characters">
        <svg viewBox="0 0 180 90" aria-hidden="true">
          <g className="chibi-shadow">
            <ellipse cx="90" cy="82" rx="75" ry="7" />
          </g>
          <g>
            <path fill="#8a542f" d="M15 28h66v10H15z" />
            <path fill="#9c6338" d="M27 11h42l7 20H20z" />
            <circle fill="#f2bd8c" cx="48" cy="43" r="20" />
            <circle fill="#29231f" cx="41" cy="43" r="2.5" />
            <circle fill="#29231f" cx="55" cy="43" r="2.5" />
            <path fill="none" stroke="#9d4f4a" stroke-width="2" d="M41 51q7 6 14 0" />
            <path fill="#f0bd27" d="M25 61q23-14 46 0v24H25z" />
            <path fill="#d73535" d="m38 59 10 10 10-10-10-6z" />
            <circle fill="#fff" cx="65" cy="69" r="6" />
            <path
              fill="#d5a62c"
              d="m65 64 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"
            />
          </g>
          <g>
            <path fill="#7f4bac" d="M115 25q20-22 40 0l-5 13h-30z" />
            <circle fill="#e9b78d" cx="135" cy="43" r="19" />
            <circle fill="#29231f" cx="128" cy="43" r="2.5" />
            <circle fill="#29231f" cx="142" cy="43" r="2.5" />
            <path fill="#fff" d="M109 61q26-16 52 0v24h-52z" />
            <path fill="#77bd43" d="m109 64 17-8 9 14 9-14 17 8v21h-52z" />
            <path fill="#68439a" d="M128 68h14v9h-14z" />
            <path fill="#d64745" d="M132 71h4v4h-4z" />
            <path fill="#d9e5ed" d="m110 64-13-10v26l13-5zM160 64l13-10v26l-13-5z" />
          </g>
        </svg>
      </div>
    );
  }
  if (theme === "avengers") {
    return (
      <div className={cls} aria-label="Cute armored hero and shield hero characters">
        <svg viewBox="0 0 180 90" aria-hidden="true">
          <g className="chibi-shadow">
            <ellipse cx="90" cy="82" rx="75" ry="7" />
          </g>
          <g>
            <circle fill="#c52c32" cx="48" cy="40" r="25" />
            <path fill="#e4a44a" d="M33 22h30l6 18-10 17H37L27 40z" />
            <path fill="#f4d18b" d="M37 34h22v16H37z" />
            <path fill="#dcefff" d="m37 37 8 2-8 5zM59 37l-8 2 8 5z" />
            <path fill="#ad2029" d="M23 62q25-15 50 0v23H23z" />
            <path fill="#f0b944" d="M42 61h12l-6 13z" />
            <circle fill="#8fe4ff" cx="48" cy="70" r="5" />
          </g>
          <g>
            <circle fill="#235496" cx="135" cy="40" r="25" />
            <path fill="#fff" d="m135 16 5 11h-10z" />
            <path fill="#f0bd91" d="M119 34h32v22h-32z" />
            <path fill="#235496" d="M115 26h40v15l-9-9-11 8-11-8-9 9z" />
            <circle fill="#2a2522" cx="128" cy="43" r="2.5" />
            <circle fill="#2a2522" cx="142" cy="43" r="2.5" />
            <path fill="#214d87" d="M110 63q25-16 50 0v22h-50z" />
            <circle fill="#d82e38" cx="158" cy="67" r="17" />
            <circle fill="#fff" cx="158" cy="67" r="12" />
            <circle fill="#2860a4" cx="158" cy="67" r="7" />
            <path
              fill="#fff"
              d="m158 61 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"
            />
          </g>
        </svg>
      </div>
    );
  }
  if (theme === "spiderman") {
    return (
      <div className={cls} aria-label="Cute red and black spider hero characters">
        <svg viewBox="0 0 180 90" aria-hidden="true">
          <g className="chibi-shadow">
            <ellipse cx="90" cy="82" rx="75" ry="7" />
          </g>
          <g>
            <circle fill="#cf2530" cx="48" cy="41" r="25" />
            <path fill="#fff" stroke="#202020" stroke-width="2" d="m30 34 14 5-10 10zM66 34l-14 5 10 10z" />
            <g fill="none" stroke="#2d2927" stroke-width="1.4">
              <path d="M48 16v50M25 27l46 28M71 27L25 55" />
              <path d="M31 22q17 15 34 0M25 40q23 13 46 0" />
            </g>
            <path fill="#be1e28" d="M22 64q26-17 52 0v21H22z" />
            <path fill="#1d4777" d="M22 72h52v13H22z" />
            <path fill="#202020" d="m48 63 4 7-4 8-4-8z" />
          </g>
          <g>
            <circle fill="#17191d" cx="135" cy="41" r="25" />
            <path fill="#f5f5f5" stroke="#d82232" stroke-width="3" d="m116 33 15 6-11 11zM154 33l-15 6 11 11z" />
            <path fill="#16181c" d="M109 64q26-17 52 0v21h-52z" />
            <path fill="#d72332" d="M109 70h52v6h-52z" />
            <path fill="#d72332" d="m135 62 5 8-5 10-5-10z" />
            <g fill="none" stroke="#d72332" stroke-width="1.4">
              <path d="M135 16v49M115 26l40 29M155 26l-40 29" />
            </g>
          </g>
        </svg>
      </div>
    );
  }
  return null;
}

export function drawImageCover(
  x: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  mirror: boolean = false
) {
  const sw = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || source.width;
  const sh = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || source.height;
  if (!sw || !sh) return;
  const sourceRatio = sw / sh;
  const targetRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let cropW = sw;
  let cropH = sh;
  if (sourceRatio > targetRatio) {
    cropW = sh * targetRatio;
    sx = (sw - cropW) / 2;
  } else if (sourceRatio < targetRatio) {
    cropH = sw / targetRatio;
    sy = (sh - cropH) / 2;
  }
  x.save();
  if (mirror) {
    x.translate(dx + dw, dy);
    x.scale(-1, 1);
    x.drawImage(source, sx, sy, cropW, cropH, 0, 0, dw, dh);
  } else {
    x.drawImage(source, sx, sy, cropW, cropH, dx, dy, dw, dh);
  }
  x.restore();
}
