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
  const hoursRemaining = minutesRemaining / 60;

  const daysRemaining = hoursRemaining / 24;

  let label: string;

  if (daysRemaining >= 1) {
    label = `${Math.floor(daysRemaining)}d ${Math.floor(hoursRemaining % 24)}h remaining`;
  } else if (hoursRemaining >= 1) {
    label = `${Math.floor(hoursRemaining)}h ${Math.floor(minutesRemaining % 60)}m remaining`;
  } else {
    label = `${Math.floor(minutesRemaining)}m remaining`;
  }

  const urgency =
    daysRemaining > 3 ? "safe" : daysRemaining > 1 ? "warning" : "danger";

  return { label, isOverdue: false, urgency };
}

export function formatDueDate(currentBlock: number, dueBlock: number): string {
  const date = blocksToDate(currentBlock, dueBlock);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function borrowDurationLabel(durationBlocks: number): string {
  const days = Math.round(durationBlocks / 144);
  return `${days}  day${days !== 1 ? "s" : ""}`;
}
