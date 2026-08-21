import React, { useState, useEffect } from "react";
import { Brand, Icon } from "./common";

interface EntranceProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
  onSoloClick: () => void;
}

export function Entrance({ onCreateClick, onJoinClick, onSoloClick }: EntranceProps) {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch testimonials on mount
  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      })
      .catch((err) => console.error("Error fetching testimonials", err));
  }, []);

  const handleSendTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          message: newMessage,
          rating: newRating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestimonials((prev) => [data.testimonial, ...prev]);
        setNewName("");
        setNewMessage("");
        setNewRating(5);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to submit testimonial", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHearts = (rating: number, clickable = false, onHeartClick?: (r: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const active = i < rating;
      return (
        <svg
          key={i}
          className={`rating-heart ${clickable ? "clickable" : ""}`}
          viewBox="0 0 24 24"
          fill={active ? "#ff4d4f" : "#ccc"}
          width={clickable ? "24" : "14"}
          height={clickable ? "24" : "14"}
          style={{ display: "inline-block", marginRight: "3px", cursor: clickable ? "pointer" : "default" }}
          onClick={() => clickable && onHeartClick && onHeartClick(i + 1)}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    });
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Baru saja";
    }
  };

  return (
    <main className="page">
      {/* Navigation */}
      <div className="shell nav">
        <Brand />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#testimonials">Ratings</a>
          <button className="btn btn-dark btn-sm" onClick={onSoloClick}>
            Solo Photo <Icon name="arrow" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="shell hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <i></i> online photobooth for two
          </span>
          <h1>
            Miles apart.
            <br />
            <em>Memories together.</em>
          </h1>
          <p>
            Create a little memory with someone you love. Start a private booth, share the link, and take four photos
            together—wherever you both are.
          </p>
          <div className="hero-actions">
            <button className="btn btn-dark" onClick={onCreateClick}>
              Create our booth <Icon name="arrow" />
            </button>
            <button className="btn btn-light" onClick={onJoinClick}>
              Join with a code
            </button>
          </div>
          <div className="mini-note">
            <div className="avatars">
              <span className="avatar av1">S</span>
              <span className="avatar av2">D</span>
              <span className="avatar av3" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="#fff" width="12" height="12">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </span>
            </div>
            No account needed · Free to try · Photos stay private
          </div>
        </div>
        <div className="visual">
          <div className="blob"></div>
          <div className="stars">
            <b className="spark s1">✦</b>
            <b className="spark s2">✦</b>
            <b className="spark s3">✦</b>
          </div>
          <div className="room-chip left">
            <strong>
              <i className="online-dot"></i>fanyy joined
            </strong>
            <span>Ready to take photos</span>
          </div>
          <div className="photo-stack">
            <div className="tape"></div>
            <div className="couple-photo">
              <div className="portrait">
                <i className="person"></i>
              </div>
              <div className="portrait two">
                <i className="person"></i>
              </div>
              <i className="heart-float" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="#ff4d4f" width="20" height="20">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </i>
            </div>
            <div className="photo-caption">us, from anywhere ♡</div>
          </div>
          <div className="room-chip right">
            <strong>Room LOVE-xxxx</strong>
            <span>2 of 2 people here</span>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {Array(2)
            .fill(
              "<span>Take photos together</span><span>Keep the moment forever</span><span>Same love, different places</span><span>Four poses, one memory</span>"
            )
            .map((text, i) => (
              <span key={i} dangerouslySetInnerHTML={{ __html: text }} />
            ))}
        </div>
      </div>

      {/* How it works */}
      <section className="shell how" id="how">
        <div className="section-heading">
          <span className="kicker">How it works</span>
          <h2>A memory in three little steps.</h2>
          <p>No complicated setup. Just you, your favorite person, and a few poses worth keeping.</p>
        </div>
        <div className="steps">
          <article className="step">
            <span className="step-num">01</span>
            <div className="step-icon">⌁</div>
            <h3>Make a private room</h3>
            <p>Get your unique booth code. Your room is private and expires automatically.</p>
          </article>
          <article className="step">
            <span className="step-num">02</span>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ display: "inline-block" }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3>Invite your person</h3>
            <p>Send the link to someone special. You'll see each other live when they join the room.</p>
          </article>
          <article className="step">
            <span className="step-num">03</span>
            <div className="step-icon">◉</div>
            <h3>Pose, snap, keep</h3>
            <p>A shared countdown captures four moments and turns them into one beautiful photostrip.</p>
          </article>
        </div>
      </section>

      {/* Testimonials / Guestbook Section */}
      <section className="guestbook-section" id="testimonials">
        <div className="shell">
          <div className="section-heading" style={{ marginBottom: "50px" }}>
            <span className="kicker">Guestbook & Ratings</span>
            <h2>What they say about us.</h2>
            <p>Read experiences from couples and besties who have captured their memories across distances.</p>
          </div>

          <div className="guestbook-grid">
            {/* Form */}
            <form className="guestbook-form" onSubmit={handleSendTestimonial}>
              <h3 style={{ fontSize: "20px", marginBottom: "15px", fontWeight: "bold" }}>Tulis kesan pesan</h3>
              
              <div className="field">
                <label>Beri Rating Hati</label>
                <div className="rating-select">
                  {renderHearts(newRating, true, (rating) => setNewRating(rating))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="nickname">Nama (Kosongkan untuk Anonim)</label>
                <input
                  id="nickname"
                  className="input"
                  type="text"
                  placeholder="e.g., Username / Anonim"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={30}
                  disabled={submitting}
                />
              </div>

              <div className="field">
                <label htmlFor="message-text">Pesan & Kesan</label>
                <textarea
                  id="message-text"
                  className="input"
                  style={{ height: "100px", padding: "12px 16px", resize: "none", fontFamily: "inherit" }}
                  placeholder="Tulis pengalaman serumu berfoto jarak jauh di sini..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={200}
                  required
                  disabled={submitting}
                />
                <small style={{ display: "block", color: "var(--muted)", marginTop: "5px", fontSize: "11px", textAlign: "right" }}>
                  {newMessage.length}/200 karakter
                </small>
              </div>

              {submitSuccess && (
                <div style={{ color: "#2d7a4d", fontSize: "13px", marginBottom: "12px", fontWeight: "600" }}>
                  ✓ Kesan pesan berhasil terkirim! Terima kasih!
                </div>
              )}

              <button className="btn btn-dark" style={{ width: "100%", height: "50px" }} type="submit" disabled={submitting || !newMessage.trim()}>
                {submitting ? "Mengirim..." : "Kirim Masukan"}
              </button>
            </form>

            {/* List */}
            <div className="testimonials-viewport">
              {testimonials.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontStyle: "italic", fontSize: "14px" }}>
                  Ayo berikan ulasan. Berikan masukan untuk trus upgrade dan berikan kesan pesan!
                </div>
              ) : (
                <div className={`testimonials-track ${testimonials.length >= 3 ? "animated" : ""}`}>
                  {(testimonials.length >= 3 ? [...testimonials, ...testimonials] : testimonials).map((t, idx) => (
                    <div key={t.id + "-" + idx} className="testimonial-card">
                      <div className="testimonial-meta">
                        <div>
                          <span className="testimonial-name">{t.name}</span>
                          <div style={{ marginTop: "2px" }}>{renderHearts(t.rating)}</div>
                        </div>
                        <span className="testimonial-date">{getRelativeTime(t.created_at)}</span>
                      </div>
                      <p className="testimonial-msg">{t.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
