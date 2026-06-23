// 1 Bitcoin block ≈ 10 minutes
const MINUTES_PER_BLOCK = 10;

export function blocksToDate(currentBlock: number, targetBlock: number): Date {
  const blocksRemaining = targetBlock - currentBlock;
  const minutesRemaining = blocksRemaining * MINUTES_PER_BLOCK;

  return new Date(Date.now());
}
