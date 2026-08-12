export type BoothEvent =
  | { type: "USER_READY"; participantId: string; ready: boolean }
  | { type: "START_SESSION"; sessionId: string }
  | { type: "COUNTDOWN"; sequence: number; captureAt: string }
  | { type: "CAPTURE"; sequence: number; captureAt: string }
  | { type: "PHOTO_UPLOADED"; sequence: number; participantId: string }
  | { type: "SESSION_FINISHED"; sessionId: string; compositePath: string };

export interface PresenceState {
  participantId: string;
  name: string;
  role: "HOST" | "GUEST";
  ready: boolean;
  onlineAt: string;
}

export const roomTopic = (roomId: string) => `room:${roomId}`;
