# TogetherBooth architecture

## Responsibility boundaries

- **Next.js App Router** owns pages, validation, LiveKit token minting, and short server operations.
- **Supabase Postgres** is the durable source of truth for rooms, participants, sessions, frames, and photo metadata.
- **Supabase Presence** tracks ephemeral online/ready state.
- **Supabase Broadcast** carries booth events (`COUNTDOWN`, `CAPTURE`, `PHOTO_UPLOADED`, `SESSION_FINISHED`).
- **LiveKit** carries camera video only. It does not own room lifecycle or photo state.
- **Supabase Storage** stores private captures and final strips under `roomId/sessionId/file`.
- **Canvas** performs capture/composition in-browser for the MVP. Move it to a Sharp worker only when device performance or consistency requires it.
- **PostHog** captures product funnel events and must never receive image data or room secrets.

## Synchronized capture

1. Host requests a capture.
2. The server or authoritative host broadcasts `captureAt = server time + 3000ms`.
3. Each client estimates clock offset and schedules its local snapshot against `captureAt`.
4. Clients upload directly to the private Storage bucket and broadcast `PHOTO_UPLOADED`.
5. The host composes the strip after both uploads exist, then stores the composite.

Never capture a remote `<video>` element as the other participant's authoritative photo. Each browser captures its own local camera at full quality.

## Privacy

- Users authenticate anonymously for MVP; they do not need to create an account, but still receive a scoped Supabase identity.
- LiveKit tokens are minted server-side, room-scoped, and short-lived.
- Photo buckets stay private and are protected by RLS.
- Signed URLs should expire quickly.
- Room state expires after 30 minutes; photo objects are deleted after 24 hours by a scheduled Edge Function.
- Server secrets are never exposed through `NEXT_PUBLIC_*` variables.

## Migration status

The existing polished prototype is mounted through `LegacyPhotobooth`. New backend modules are typed and ready. Migrate one screen at a time into React Client Components, beginning with create/join room, then waiting room, LiveKit booth, and result.
