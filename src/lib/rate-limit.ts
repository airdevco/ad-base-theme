const tokenBuckets = new Map<string, { tokens: number; lastRefill: number }>();

export function rateLimit(
  ip: string,
  maxTokens = 5,
  refillIntervalMs = 60_000
): boolean {
  const now = Date.now();
  const bucket = tokenBuckets.get(ip) ?? {
    tokens: maxTokens,
    lastRefill: now,
  };

  const elapsed = now - bucket.lastRefill;
  if (elapsed > refillIntervalMs) {
    bucket.tokens = maxTokens;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) return false;

  bucket.tokens -= 1;
  tokenBuckets.set(ip, bucket);
  return true;
}
