"use client";

import React, { useEffect, useState } from "react";
import { Entrance } from "./entrance";
import { Setup } from "./setup";
import { Join } from "./join";
import { WaitingRoom } from "./waiting-room";
import { Booth } from "./booth";
import { Result } from "./result";
import { SoloBooth } from "./solo-booth";

type PageState = "entrance" | "setup" | "join" | "waiting" | "booth" | "result" | "solo-booth";

export function PhotoboothManager() {
  const [page, setPage] = useState<PageState>("entrance");
  const [userId, setUserId] = useState<string>("");
  const [name, setName] = useState<string>("Kamu");
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [role, setRole] = useState<"HOST" | "GUEST">("HOST");
  const [sessionId, setSessionId] = useState<string>("");
  const [allUploads, setAllUploads] = useState<Record<string, string[]>>({});
  const [boothMode, setBoothMode] = useState<"solo" | "couple">("couple");

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
  const handleCreateRoom = async (hostName: string) => {
    setName(hostName);
    if (boothMode === "solo") {
      setPage("solo-booth");
      return;
    }
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
    setPage("waiting");
  };

  const handleStartSession = (sessId: string) => {
    setSessionId(sessId);
    setPage("booth");
  };

  const handleFinished = (uploads: Record<string, string[]>) => {
    setAllUploads(uploads);
    setPage("result");
  };

  const handleSoloClick = () => {
    setBoothMode("solo");
    setPage("setup");
  };

  const handleCoupleClick = () => {
    setBoothMode("couple");
    setPage("setup");
  };

  const handleRetake = () => {
    setAllUploads({});
    setSessionId("");
    if (boothMode === "solo") {
      setPage("solo-booth");
    } else {
      setPage("waiting");
    }
  };

  const handleExit = () => {
    // Clear state and return to homepage
    setRoomCode("");
    setRoomId("");
    setSessionId("");
    setAllUploads({});
    setBoothMode("couple");
    setPage("entrance");
    // Clear URL param
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#f9f5ed" }}>
        <h2>Loading NEAMOR...</h2>
      </div>
    );
  }

  switch (page) {
    case "entrance":
      return (
        <Entrance
          onCreateClick={handleCoupleClick}
          onJoinClick={() => setPage("join")}
          onSoloClick={handleSoloClick}
        />
      );
    case "setup":
      return (
        <Setup
          initialName={name}
          onExit={handleExit}
          onCreateRoom={handleCreateRoom}
          mode={boothMode}
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
          onExit={handleExit}
          onFinished={handleFinished}
        />
      );
    case "solo-booth":
      return (
        <SoloBooth
          name={name}
          userId={userId}
          onExit={handleExit}
          onFinished={handleFinished}
        />
      );
    case "result":
      return (
        <Result
          name={name}
          userId={userId}
          roomCode={roomCode}
          uploads={allUploads}
          role={role}
          mode={boothMode}
          onRetake={handleRetake}
        />
      );
    default:
      return null;
  }
}
