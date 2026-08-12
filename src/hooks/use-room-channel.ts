"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { roomTopic, type BoothEvent, type PresenceState } from "@/lib/realtime/events";

export function useRoomChannel(
  roomId: string | null,
  presence: PresenceState | null,
  onEvent: (event: BoothEvent) => void,
) {
  const [participants, setParticipants] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!roomId || !presence) return;
    const supabase = createClient();
    const channel = supabase.channel(roomTopic(roomId), {
      config: { private: true, presence: { key: presence.participantId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const states = Object.values(channel.presenceState<PresenceState>()).flatMap((items) => items);
        setParticipants(states);
      })
      .on("broadcast", { event: "booth-event" }, ({ payload }) => onEvent(payload as BoothEvent))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track(presence);
      });

    return () => void supabase.removeChannel(channel);
  }, [roomId, presence, onEvent]);

  return participants;
}
