export type RoomStatus =
  | "WAITING"
  | "READY"
  | "COUNTDOWN"
  | "CAPTURING"
  | "PROCESSING"
  | "FINISHED"
  | "EXPIRED";

export type ParticipantRole = "HOST" | "GUEST";
export type ParticipantStatus = "JOINED" | "READY" | "DISCONNECTED";
export type SessionStatus = "CREATED" | "CAPTURING" | "PROCESSING" | "FINISHED" | "FAILED";

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          max_participants: number;
          status: RoomStatus;
          frame_id: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          host_id: string;
          max_participants?: number;
          status?: RoomStatus;
          frame_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Insert"]>;
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          name: string;
          role: ParticipantRole;
          status: ParticipantStatus;
          joined_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          name: string;
          role: ParticipantRole;
          status?: ParticipantStatus;
          joined_at?: string;
          last_seen_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          room_id: string;
          status: SessionStatus;
          capture_count: number;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          status?: SessionStatus;
          capture_count?: number;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string | null;
          sequence: number;
          object_path: string;
          kind: "CAPTURE" | "COMPOSITE";
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id?: string | null;
          sequence: number;
          object_path: string;
          kind?: "CAPTURE" | "COMPOSITE";
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
        Relationships: [];
      };
      frames: {
        Row: { id: string; slug: string; name: string; category: string; config: Record<string, unknown>; active: boolean };
        Insert: { id?: string; slug: string; name: string; category: string; config?: Record<string, unknown>; active?: boolean };
        Update: Partial<Database["public"]["Tables"]["frames"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_status: RoomStatus;
      participant_role: ParticipantRole;
      participant_status: ParticipantStatus;
      session_status: SessionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
