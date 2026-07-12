const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Accepts a raw room id or a full shareable room URL and extracts the room id. */
export function extractRoomId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(UUID_RE);
  return match ? match[0] : null;
}

export function getOrCreateUserId(): string {
  const key = 'canvas:userId';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function getStoredUserName(): string {
  return localStorage.getItem('canvas:userName') ?? '';
}

export function setStoredUserName(name: string): void {
  localStorage.setItem('canvas:userName', name);
}
