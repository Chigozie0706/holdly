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

  }
}
