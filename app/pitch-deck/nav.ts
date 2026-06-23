// Lógica pura de índice de slide. 1-based en el hash (#1 = primer slide), 0-based interno.
export function clampIndex(i: number, total: number): number {
  if (!Number.isFinite(i)) return 0;
  return Math.max(0, Math.min(total - 1, Math.trunc(i)));
}

export function parseHash(hash: string, total: number): number {
  const m = /^#?(\d+)$/.exec(hash);
  if (!m) return 0;
  return clampIndex(parseInt(m[1], 10) - 1, total);
}

export function hashFor(index: number): string {
  return `#${index + 1}`;
}
