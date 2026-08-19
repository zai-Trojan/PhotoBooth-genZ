import React from "react";
import { Brand, Icon } from "./common";

interface EntranceProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function Entrance({ onCreateClick, onJoinClick }: EntranceProps) {
  return (
    <main className="page">
      {/* Navigation */}
      <div className="shell nav">
        <Brand />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#">About</a>
          <button className="btn btn-dark btn-sm" onClick={onCreateClick}>
            Create a booth <Icon name="arrow" />
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
            <em>Same frame.</em>
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
              <span className="avatar av3">♥</span>
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
              <i className="online-dot"></i>Sarah joined
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
              <i className="heart-float">♥</i>
            </div>
            <div className="photo-caption">us, from anywhere ♡</div>
          </div>
          <div className="room-chip right">
            <strong>Room LOVE-7281</strong>
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
            <p>Pick a frame and get your unique booth code. Your room is private and expires automatically.</p>
          </article>
          <article className="step">
            <span className="step-num">02</span>
            <div className="step-icon">♡</div>
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
    </main>
  );
}
