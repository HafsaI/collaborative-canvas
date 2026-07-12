export const USER_COLORS = [
  '#f97362', '#f5a623', '#f2c94c', '#6fcf97',
  '#4fb0ff', '#7c8cff', '#c589f2', '#ff7ab6',
];

export function colorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return USER_COLORS[hash % USER_COLORS.length];
}

export const STROKE_COLORS = [
  '#1a1a1a', '#e03131', '#f08c00', '#2f9e44',
  '#1971c2', '#7048e8', '#e64980', '#ffffff',
];
