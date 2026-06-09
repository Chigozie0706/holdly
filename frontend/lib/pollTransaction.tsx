export async function pollUntilChanged({
  check,
  expectedValue,
}: {
  check: () => Promise<any>;
}) {}
