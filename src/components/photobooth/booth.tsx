import React, { useEffect, useRef, useState, useCallback } from "react";
import { FlowNav, Icon, drawImageCover } from "./common";
import { LiveKitRoom, VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { createClient } from "@/lib/supabase/client";
import { roomTopic } from "@/lib/realtime/events";
import type { BoothEvent } from "@/lib/realtime/events";

interface BoothProps {
  roomCode: string;
  roomId: string;
  name: string;
  userId: string;
  role: "HOST" | "GUEST";
  sessionId: string;
  frame: string;
  onExit: () => void;
  onFinished: (compositeUrl: string) => void;
}

export function Booth(props: BoothProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch LiveKit token on mount
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: props.roomCode,
            participantName: props.name,
            participantId: props.userId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch LiveKit token");
        }

        const data = await res.json();
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "LiveKit is currently unavailable.");
      }
    }
    fetchToken();
  }, [props.roomCode, props.name, props.userId]);

  if (error) {
    return (
      <main className="flow-page">
        <FlowNav step={3} onExit={props.onExit} />
        <div className="flow-wrap text-center p-8">
          <h2 style={{ color: "#d83535", marginBottom: "15px" }}>LiveKit Error</h2>
          <p>{error}</p>
          <button className="btn btn-dark mt-4" onClick={props.onExit}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (!token || !serverUrl) {
    return (
      <main className="flow-page">
        <FlowNav step={3} onExit={props.onExit} />
        <div className="flow-wrap text-center p-8">
          <h2>Entering photobooth...</h2>
          <p style={{ marginTop: "10px", opacity: 0.7 }}>Securing connection to video servers</p>
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={false}
      video={true}
      data-lk-theme="default"
    >
      <BoothInner {...props} />
    </LiveKitRoom>
  );
}

function BoothInner({
  roomCode,
  roomId,
  name,
  userId,
  role,
  sessionId,
  frame,
  onExit,
  onFinished,
}: BoothProps) {
  const [shot, setShot] = useState(0); // Current shot: 0 to 3
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [statusText, setStatusText] = useState("Ready?");
  const [uploads, setUploads] = useState<Record<string, string[]>>({}); // Key: participantId, Value: array of 4 urls
  const [isComposing, setIsComposing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve LiveKit camera video tracks
  const tracks = useTracks([Track.Source.Camera]);
  const localTrack = tracks.find((t) => t.participant.isLocal);
  const remoteTrack = tracks.find((t) => !t.participant.isLocal);

  const supabaseRef = useRef(createClient());
  const channelRef = useRef<any>(null);

  // Take a local frame snapshot from the HTMLVideoElement
  const captureLocalFrame = useCallback((): string | null => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let success = false;
    if (containerRef.current) {
      // Find the video element within the local video track container
      const video = containerRef.current.querySelector(".local-pane video") as HTMLVideoElement | null;
      if (video && video.videoWidth) {
        drawImageCover(ctx, video, 0, 0, canvas.width, canvas.height, true);
        success = true;
      }
    }

    if (!success) {
      // Fallback: draw a colored placeholder box with user name
      ctx.fillStyle = "#2d2925";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "28px Arial";
      ctx.textAlign = "center";
      ctx.fillText(name || "Me", 300, 225);
    }

    return canvas.toDataURL("image/jpeg", 0.9);
  }, [name]);

  // Upload image to database/storage and broadcast URL
  const uploadAndBroadcast = useCallback(async (seq: number, base64Image: string) => {
    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          participantId: userId,
          sequence: seq + 1, // 1-based sequence
          image: base64Image,
          kind: "CAPTURE",
        }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const signedUrl = data.url;

      // Broadcast photo uploaded event with the signed URL
      await channelRef.current.send({
        type: "broadcast",
        event: "booth-event",
        payload: {
          type: "PHOTO_UPLOADED",
          sequence: seq,
          participantId: userId,
          url: signedUrl,
        },
      });

      // Update local uploads state
      setUploads((prev) => {
        const next = { ...prev };
        if (!next[userId]) next[userId] = [];
        next[userId][seq] = signedUrl;
        return next;
      });
    } catch (err) {
      console.error("Photo upload error:", err);
    }
  }, [sessionId, userId]);

  // Execute countdown visual effect and snapshot
  const triggerCountdown = useCallback(async (seq: number, captureAt: number) => {
    setIsCapturing(true);
    setStatusText("Get ready!");

    const sleepUntil = async (timestamp: number) => {
      const delay = timestamp - Date.now();
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    };

    // 1. Show "3" at captureAt - 3000ms
    await sleepUntil(captureAt - 3000);
    setCountdown(3);

    // 2. Show "2" at captureAt - 2000ms
    await sleepUntil(captureAt - 2000);
    setCountdown(2);

    // 3. Show "1" at captureAt - 1000ms
    await sleepUntil(captureAt - 1000);
    setCountdown(1);

    // 4. Capture at captureAt
    await sleepUntil(captureAt);
    setCountdown(null);
    setStatusText("Cheese!");

    // Flash effect
    if (containerRef.current) {
      const flash = document.createElement("div");
      flash.className = "flash";
      containerRef.current.append(flash);
      setTimeout(() => flash.remove(), 600);
    }

    // Capture local snapshot
    const imgData = captureLocalFrame();
    if (imgData) {
      await uploadAndBroadcast(seq, imgData);
    }

    setIsCapturing(false);
  }, [captureLocalFrame, uploadAndBroadcast]);

  // Handle incoming broadcast events during photo shoot
  const handleBoothEvent = useCallback(async (event: BoothEvent) => {
    if (event.type === "COUNTDOWN") {
      const captureTime = new Date(event.captureAt).getTime();
      triggerCountdown(event.sequence, captureTime);
    } 
    else if (event.type === "PHOTO_UPLOADED") {
      const { sequence, participantId, url } = event as any;
      setUploads((prev) => {
        const next = { ...prev };
        if (!next[participantId]) next[participantId] = [];
        next[participantId][sequence] = url;
        return next;
      });
    } 
    else if (event.type === "SESSION_FINISHED") {
      onFinished(event.compositePath);
    }
  }, [triggerCountdown, onFinished]);

  // Subscribe to public channel
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(roomTopic(roomId), {
      config: { private: false },
    });

    channel
      .on("broadcast", { event: "booth-event" }, ({ payload }) => {
        handleBoothEvent(payload as BoothEvent);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, handleBoothEvent]);

  // Composing final strip (executed by Host)
  const composeFinalStrip = useCallback(async (allUploads: Record<string, string[]>) => {
    setIsComposing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1960;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // Draw background
      const colors: Record<string, string> = {
        pink: "#edabb0",
        black: "#292724",
        cream: "#e9ddc8",
        sage: "#aebc98",
        blue: "#aabecd",
        toystory: "#39a8df",
        avengers: "#152f55",
        spiderman: "#c8212c",
      };
      ctx.fillStyle = colors[frame] || "#edabb0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text caption
      const otherId = Object.keys(allUploads).find((id) => id !== userId) || "Guest";
      const hostName = name;
      const guestName = remoteTrack?.participant.name || "Mika";

      ctx.fillStyle = ["black", "avengers", "spiderman"].includes(frame) ? "white" : "#282621";
      ctx.textAlign = "center";
      ctx.font = "italic 58px Georgia";
      ctx.fillText(`${hostName} & ${guestName} ♡`, 450, 85);

      // Helper function to load image
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = url;
        });
      };

      // Load all 8 images
      const hostImages = allUploads[userId] || [];
      const guestImages = allUploads[otherId] || [];

      const loadedHost: HTMLImageElement[] = [];
      const loadedGuest: HTMLImageElement[] = [];

      for (let i = 0; i < 4; i++) {
        if (hostImages[i]) loadedHost[i] = await loadImage(hostImages[i]);
        if (guestImages[i]) loadedGuest[i] = await loadImage(guestImages[i]);
      }

      // Draw images onto the strip
      for (let i = 0; i < 4; i++) {
        const y = 125 + i * 420;
        if (loadedHost[i]) {
          // Draw host on left pane
          drawImageCover(ctx, loadedHost[i], 35, y, 410, 360);
        }
        if (loadedGuest[i]) {
          // Draw guest on right pane (mirror them to look symmetrical)
          drawImageCover(ctx, loadedGuest[i], 455, y, 410, 360, true);
        }
      }

      // Draw footer info
      ctx.font = "28px Arial";
      ctx.fillText(
        `${new Date().toLocaleDateString("en-GB")} · TOGETHERBOOTH`,
        450,
        1905
      );

      // Upload composite image
      const base64Composite = canvas.toDataURL("image/jpeg", 0.9);
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          participantId: null, // null for composite strip
          sequence: 1,
          image: base64Composite,
          kind: "COMPOSITE",
        }),
      });

      if (!res.ok) throw new Error("Composite upload failed");
      const data = await res.json();
      const compositeSignedUrl = data.url;

      // Broadcast finished session
      await channelRef.current.send({
        type: "broadcast",
        event: "booth-event",
        payload: {
          type: "SESSION_FINISHED",
          sessionId,
          compositePath: compositeSignedUrl,
        },
      });

      onFinished(compositeSignedUrl);

    } catch (err) {
      console.error("Error creating strip:", err);
      setIsComposing(false);
      setStatusText("Failed to compile photostrip");
    }
  }, [frame, userId, name, remoteTrack, sessionId, onFinished]);

  // Check if both users have uploaded photo for the current shot sequence
  useEffect(() => {
    const participantsList = Object.keys(uploads);
    if (participantsList.length < 2) return; // Need both to trigger

    const hostId = userId;
    const guestId = participantsList.find((id) => id !== userId)!;

    const hostPhotos = uploads[hostId] || [];
    const guestPhotos = uploads[guestId] || [];

    // If both have uploaded the photo for the current shot
    if (hostPhotos[shot] && guestPhotos[shot]) {
      if (shot < 3) {
        // Move to the next shot automatically after 3 seconds
        setTimeout(() => {
          setShot((s) => s + 1);
          setStatusText("Prepare for next pose!");
          if (role === "HOST") {
            triggerNextCountdown(shot + 1);
          }
        }, 3000);
      } else {
        // Shoot complete!
        setStatusText("Creating your memories...");
        if (role === "HOST") {
          composeFinalStrip(uploads);
        }
      }
    }
  }, [uploads, shot, role, userId, composeFinalStrip]);

  // Host function to schedule and broadcast COUNTDOWN
  const triggerNextCountdown = (nextSeq: number) => {
    const captureAt = new Date(Date.now() + 4500).toISOString(); // 4.5 seconds to capture
    channelRef.current.send({
      type: "broadcast",
      event: "booth-event",
      payload: {
        type: "COUNTDOWN",
        sequence: nextSeq,
        captureAt,
      },
    });
  };

  // Host starts the very first capture
  const handleFirstCapture = () => {
    if (role !== "HOST" || isCapturing || shot > 0) return;
    triggerNextCountdown(0);
  };

  return (
    <main className="booth-page">
      <FlowNav step={3} onExit={onExit} />
      <div className="flow-wrap" ref={containerRef}>
        <div className="booth-top">
          <div>
            <h2>Four little moments</h2>
            <p>{isComposing ? "We are printing your strip..." : "Look at the camera and have fun with it."}</p>
          </div>
          <div>
            <div className="shot-dots">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={`shot-dot ${i < shot ? "done" : i === shot && isCapturing ? "active" : ""}`}></i>
              ))}
            </div>
            <p style={{ textAlign: "right" }}>{shot + 1} of 4</p>
          </div>
        </div>

        <div className="live-grid" id="live-grid">
          {/* Local Pane */}
          <div className="camera-view local-pane">
            {localTrack ? (
              <VideoTrack trackRef={localTrack} className="live-video" />
            ) : (
              <div className="demo-face"></div>
            )}
            <span className="cam-label">● {name} (You)</span>
          </div>

          {/* Remote Pane */}
          <div className="camera-view remote-pane">
            {remoteTrack ? (
              <VideoTrack trackRef={remoteTrack} className="live-video" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full p-4" style={{ backgroundColor: "#282621", color: "#f9f5ed" }}>
                <span>📹</span>
                <b>Connecting to partner...</b>
              </div>
            )}
            <span className="cam-label">● {remoteTrack?.participant.name || "Partner"}</span>
          </div>

          {countdown !== null && (
            <div className="countdown-overlay">
              <div className="countdown-number">
                <small>Photo {shot + 1} of 4</small>
                {countdown}
              </div>
            </div>
          )}
        </div>

        <div className="booth-controls">
          <span style={{ color: "#aaa79f", fontSize: "12px", width: "120px" }}>{statusText}</span>
          
          {role === "HOST" ? (
            <button
              className="shutter"
              id="shutter"
              onClick={handleFirstCapture}
              disabled={isCapturing || shot > 0 || !remoteTrack || isComposing}
              aria-label="Take photo"
            ></button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="badge">Waiting for Host to snap...</span>
            </div>
          )}

          <span style={{ color: "#aaa79f", fontSize: "12px", width: "120px", textAlign: "right" }}>
            Photo {shot + 1}/4
          </span>
        </div>
      </div>
    </main>
  );
}
