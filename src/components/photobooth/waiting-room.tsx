import React, { useEffect, useRef, useState, useCallback } from "react";
import { FlowNav, Icon } from "./common";
import { useRoomChannel } from "@/hooks/use-room-channel";
import type { PresenceState, BoothEvent } from "@/lib/realtime/events";
import { createClient } from "@/lib/supabase/client";
import { roomTopic } from "@/lib/realtime/events";

interface WaitingRoomProps {
  roomCode: string;
  roomId: string;
  name: string;
  userId: string;
  role: "HOST" | "GUEST";
  onExit: () => void;
  onStartSession: (sessionId: string) => void;
}

export function WaitingRoom({
  roomCode,
  roomId,
  name,
  userId,
  role,
  onExit,
  onStartSession,
}: React.PropsWithChildren<WaitingRoomProps>) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "copied">("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Prepare presence state
  const presenceState: PresenceState = React.useMemo(() => ({
    participantId: userId,
    name,
    role,
    ready: role === "HOST" ? (stream !== null) : ready,
    onlineAt: new Date().toISOString(),
  }), [userId, name, role, ready, stream]);

  // 2. Event handler for incoming realtime broadcast events
  const handleEvent = useCallback((event: BoothEvent) => {
    if (event.type === "START_SESSION") {
      onStartSession(event.sessionId);
    }
  }, [onStartSession]);

  // 3. Subscribe to Supabase channel for presence & events
  const participants = useRoomChannel(roomId, presenceState, handleEvent);

  // Find the other participant
  const otherParticipant = participants.find((p) => p.participantId !== userId);

  // 4. Request camera access
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setStream(media);
      showNotice("Camera enabled successfully!");
    } catch (e) {
      console.error(e);
      showNotice("Camera unavailable — demo preview enabled");
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const copyRoomCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopyStatus("copied");
    showNotice("Room code copied!");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard?.writeText(link);
    setInviteStatus("copied");
    showNotice("Invitation link copied!");
    setTimeout(() => setInviteStatus("idle"), 2000);
  };

  // Host function to initialize the database session and broadcast START_SESSION
  const handleStartBooth = async () => {
    if (role !== "HOST") return;
    try {
      const res = await fetch("/api/rooms/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      if (!res.ok) throw new Error("Failed to create photo session");
      const { session } = await res.json();

      // Broadcast START_SESSION to both participants
      const supabase = createClient();
      await supabase.channel(roomTopic(roomId)).send({
        type: "broadcast",
        event: "booth-event",
        payload: {
          type: "START_SESSION",
          sessionId: session.id,
        },
      });

      onStartSession(session.id);
    } catch (err: any) {
      showNotice(err.message || "Error starting photobooth");
    }
  };

  const isHostReady = stream !== null;
  const isBothReady = isHostReady && (otherParticipant?.ready ?? false);

  return (
    <main className="flow-page">
      <FlowNav step={2} onExit={onExit} />
      <div className="flow-wrap">
        <header className="waiting-head">
          <span className="eyebrow">
            <i></i> waiting room
          </span>
          <h1>Almost picture time.</h1>
          <p>Check your camera, invite your person, then get ready together.</p>
        </header>

        <div className="room-bar">
          <div>
            <div className="code-label">Your private room</div>
            <div className="code">{roomCode}</div>
          </div>
          <div className="room-actions">
            <button className="btn btn-light btn-sm" onClick={copyRoomCode}>
              <Icon name="copy" /> <span>{copyStatus === "copied" ? "Copied!" : "Copy code"}</span>
            </button>
            <button className="btn btn-pink btn-sm" onClick={copyInviteLink}>
              <Icon name="link" /> <span>{inviteStatus === "copied" ? "Copied!" : "Copy invite link"}</span>
            </button>
          </div>
        </div>

        <div className="camera-grid">
          {/* My Camera Box */}
          <article className="camera-card">
            <div className="camera-view" id="my-camera">
              {stream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="cam-placeholder">
                  <div>
                    <span>◉</span>
                    <b>Camera preview</b>
                    <br />
                    <small>Enable your camera to get ready</small>
                  </div>
                </div>
              )}
            </div>
            <div className="camera-meta">
              <span className="person-name">
                {name} <small>· you</small>
              </span>
              <span className={`status ${stream ? "" : "wait"}`}>{stream ? "● Camera on" : "Camera off"}</span>
            </div>
          </article>

          {/* Partner Camera Box */}
          <article className="camera-card">
            <div className="camera-view">
              {otherParticipant ? (
                <div className="flex flex-col items-center justify-center text-center h-full p-4" style={{ backgroundColor: "#282621", color: "#f9f5ed" }}>
                  <span style={{ fontSize: "48px", marginBottom: "10px" }}>👤</span>
                  <b>{otherParticipant.name} is in the room</b>
                  <p style={{ opacity: 0.7, fontSize: "14px", marginTop: "5px" }}>
                    {otherParticipant.ready ? "Ready to shoot!" : "Configuring camera..."}
                  </p>
                </div>
              ) : (
                <div className="cam-placeholder">
                  <div>
                    <span style={{ fontSize: "24px" }}>⏳</span>
                    <b>Waiting for partner...</b>
                    <br />
                    <small>Share the invite link to start together</small>
                  </div>
                </div>
              )}
            </div>
            <div className="camera-meta">
              <span className="person-name">{otherParticipant ? otherParticipant.name : "Partner"}</span>
              <span className={`status ${otherParticipant?.ready ? "" : "wait"}`}>
                {otherParticipant
                  ? otherParticipant.ready
                    ? "● Ready"
                    : "● Connected (Not ready)"
                  : "Offline"}
              </span>
            </div>
          </article>
        </div>

        <div className="waiting-footer">
          <button className="btn btn-light" onClick={startCamera}>
            ◉ Enable camera
          </button>

          {role === "HOST" ? (
            <button
              className={`btn ${isBothReady ? "btn-pink" : "btn-dark"}`}
              onClick={handleStartBooth}
              disabled={!isBothReady}
            >
              Start photobooth <Icon name="arrow" />
            </button>
          ) : (
            <button
              className={`btn ${ready ? "btn-pink" : "btn-dark"}`}
              onClick={() => setReady(!ready)}
              disabled={!stream}
            >
              {ready ? "Waiting for host to start..." : <>I'm ready <Icon name="check" /></>}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="notice show" id="notice">
          {notice}
        </div>
      )}
    </main>
  );
}
