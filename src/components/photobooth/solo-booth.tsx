"use client";

import React, { useEffect, useRef, useState } from "react";
import { Brand, Icon } from "./common";

interface SoloBoothProps {
  name: string;
  userId: string;
  onExit: () => void;
  onFinished: (uploads: Record<string, string[]>) => void;
}

export function SoloBooth({ name, userId, onExit, onFinished }: SoloBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotsTaken, setShotsTaken] = useState<number>(0);
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      })
      .then((s) => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error("Camera access failed", err);
        setCameraError("Gagal mengakses kamera. Pastikan izin kamera telah diaktifkan.");
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = (): string => {
    if (!videoRef.current) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Mirror image for realistic selfie feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.75);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const startSession = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setShotsTaken(0);
    const photos: string[] = [];

    for (let shot = 0; shot < 4; shot++) {
      // Countdown 3, 2, 1
      for (let count = 3; count >= 1; count--) {
        setCountdown(count);
        await sleep(1000);
      }
      setCountdown(null);

      // Flash & Capture
      setFlash(true);
      const dataUrl = captureFrame();
      if (dataUrl) {
        photos.push(dataUrl);
      }
      setShotsTaken(shot + 1);
      setLocalPhotos([...photos]);
      await sleep(150); // Flash duration
      setFlash(false);

      // Interval between shots
      if (shot < 3) {
        await sleep(1800);
      }
    }

    // Send final photos to manager
    await sleep(800);
    onFinished({ [userId]: photos });
  };

  return (
    <div className="booth-page">
      {/* Navbar */}
      <div className="shell flow-nav">
        <Brand onClick={onExit} theme="dark" />
        <button className="btn btn-ghost btn-sm" onClick={onExit} style={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
          Exit Booth
        </button>
      </div>

      <div className="shell" style={{ maxWidth: "600px", marginTop: "30px" }}>
        <div className="booth-top">
          <div>
            <h2>Solo Photobooth</h2>
            <p>Berposelah sesukamu. 4 foto akan diambil secara otomatis.</p>
          </div>
          <div className="shot-dots">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={`shot-dot ${i < shotsTaken ? "done" : ""}`} />
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div className="live-grid" style={{ gridTemplateColumns: "1fr", maxWidth: "100%" }}>
          <div className="camera-view" style={{ aspectRatio: "4/3", background: "#1c1b18" }}>
            {cameraError ? (
              <div className="cam-placeholder" style={{ color: "#aaa" }}>
                <span>✕</span>
                <p>{cameraError}</p>
              </div>
            ) : !stream ? (
              <div className="cam-placeholder" style={{ color: "#aaa" }}>
                <span>📹</span>
                <p>Memuat kamera...</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted />
            )}

            {/* Labels */}
            <div className="cam-label" style={{ color: "white" }}>
              {name} (Solo)
            </div>

            {/* Flash screen overlay */}
            {flash && <div className="flash" />}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="countdown-overlay">
                <div className="countdown-number" key={countdown} style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <small style={{ color: "white", display: "block", marginBottom: "15px" }}>Get Ready!</small>
                  <span>{countdown}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="booth-controls">
          <button
            className="shutter"
            onClick={startSession}
            disabled={isPlaying || !stream}
            title="Mulai Sesi Foto"
          />
        </div>
      </div>
    </div>
  );
}
