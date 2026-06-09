export async function pollUntilChanged({
  check,
  expectedValue,
  maxAttempts = 20,
  intervalMs = 3000,
}: {
  check: () => Promise<any>;
  expectedValue: any;
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await check();
      if (result === expectedValue) return true;
    } catch {
      // ignore errors during polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
