"use client";

import React, { useEffect, useState } from "react";
import { Entrance } from "./entrance";
import { Setup } from "./setup";
import { Join } from "./join";
import { WaitingRoom } from "./waiting-room";
import { Booth } from "./booth";
import { Result } from "./result";

type PageState = "entrance" | "setup" | "join" | "waiting" | "booth" | "result";

export function PhotoboothManager() {
  const [page, setPage] = useState<PageState>("entrance");
  const [userId, setUserId] = useState<string>("");
  const [name, setName] = useState<string>("Kamu");
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [role, setRole] = useState<"HOST" | "GUEST">("HOST");
  const [frame, setFrame] = useState<string>("pink");
  const [sessionId, setSessionId] = useState<string>("");
  const [compositeUrl, setCompositeUrl] = useState<string>("");

  // 1. Initialize user ID on client side
  useEffect(() => {
    let id = sessionStorage.getItem("tb_user_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tb_user_id", id);
    }
    setUserId(id);

    // 2. Parse room query parameter to support direct invite joining
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
      setRole("GUEST");
      setPage("join");
    }
  }, []);

  // HOST creates a room
  const handleCreateRoom = async (hostName: string, selectedFrame: string) => {
    setName(hostName);
    setFrame(selectedFrame);
    setRole("HOST");

    // Call API to create a room in Neon DB
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostId: userId,
        frameId: null, // Can be mapped later or left nullable
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create room");
    }

    const { room } = await res.json();
    setRoomId(room.id);
    setRoomCode(room.code);
    
    // Auto join the host as participant
    const joinRes = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomCode: room.code,
        userId,
        name: hostName,
        role: "HOST",
      }),
    });

    if (!joinRes.ok) {
      const joinErr = await joinRes.json();
      throw new Error(joinErr.error || "Failed to join room as host");
    }

    setPage("waiting");
  };

  // GUEST joins a room
  const handleJoinRoom = async (guestName: string, code: string) => {
    setName(guestName);
    setRoomCode(code);
    setRole("GUEST");

    // Call API to join the room in Neon DB
    const res = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomCode: code,
        userId,
        name: guestName,
        role: "GUEST",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to join room");
    }

    const { room } = await res.json();
    setRoomId(room.id);
    setFrame(room.frame_id || "pink"); // Fallback to pink if null
    setPage("waiting");
  };

  const handleStartSession = (sessId: string) => {
    setSessionId(sessId);
    setPage("booth");
  };

  const handleFinished = (url: string) => {
    setCompositeUrl(url);
    setPage("result");
  };

  const handleRetake = () => {
    setCompositeUrl("");
    setSessionId("");
    // Return to waiting room for a new shoot
    setPage("waiting");
  };

  const handleExit = () => {
    // Clear state and return to homepage
    setRoomCode("");
    setRoomId("");
    setSessionId("");
    setCompositeUrl("");
    setPage("entrance");
    // Clear URL param
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#f9f5ed" }}>
        <h2>Loading TogetherBooth...</h2>
      </div>
    );
  }

  switch (page) {
    case "entrance":
      return (
        <Entrance
          onCreateClick={() => setPage("setup")}
          onJoinClick={() => setPage("join")}
        />
      );
    case "setup":
      return (
        <Setup
          initialName={name}
          onExit={handleExit}
          onCreateRoom={handleCreateRoom}
        />
      );
    case "join":
      return (
        <Join
          initialCode={roomCode}
          onExit={handleExit}
          onJoinRoom={handleJoinRoom}
        />
      );
    case "waiting":
      return (
        <WaitingRoom
          roomCode={roomCode}
          roomId={roomId}
          name={name}
          userId={userId}
          role={role}
          onExit={handleExit}
          onStartSession={handleStartSession}
        />
      );
    case "booth":
      return (
        <Booth
          roomCode={roomCode}
          roomId={roomId}
          name={name}
          userId={userId}
          role={role}
          sessionId={sessionId}
          frame={frame}
          onExit={handleExit}
          onFinished={handleFinished}
        />
      );
    case "result":
      return (
        <Result
          name={name}
          roomCode={roomCode}
          compositeUrl={compositeUrl}
          onRetake={handleRetake}
        />
      );
    default:
      return null;
  }
}
