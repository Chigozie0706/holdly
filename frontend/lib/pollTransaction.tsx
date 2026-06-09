export async function pollUntilChanged({
  check,
  expectedValue,
  maxAttempts = 20,
  intervalMs = 3000,
}: {
  check: () => Promise<any>;
}) {}
