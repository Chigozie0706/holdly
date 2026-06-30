// 1 Bitcoin block ≈ 10 minutes
const MINUTES_PER_BLOCK = 10;

export function blocksToDate(currentBlock: number, targetBlock: number): Date {
  const blocksRemaining = targetBlock - currentBlock;
  const minutesRemaining = blocksRemaining * MINUTES_PER_BLOCK;

  return new Date(Date.now() + minutesRemaining * 60 * 1000);
}

export function formatTimeRemaining(
  currentBlock: number,
  dueBlock: number,
): {
  label: string;
  isOverdue: boolean;
  urgency: "safe" | "warning" | "danger" | "overdue";
} {
  const blocksRemaining = dueBlock - currentBlock;

  if (blocksRemaining <= 0) {
    return { label: "Overdue", isOverdue: true, urgency: "overdue" };
  }

  const minutesRemaining = blocksRemaining * MINUTES_PER_BLOCK;
}

export function borrowDurationLabel(durationBlocks: number): string {
  const days = Math.round(durationBlocks / 144);
  return `${days}  day${days !== 1 ? "s" : ""}`;
}
