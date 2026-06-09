export async function pollUntilChanged({
  check,
}: {
  check: () => Promise<any>;
}) {}
