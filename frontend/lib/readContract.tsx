import {
  cvToJSON,
  deserializeCV,
  serializeCV,
  ClarityValue,
} from "@stacks/transactions";

export async function readContract({
  contractAddress,
  contractName,
  functionName,
  functionArgs = [],
}: {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: ClarityValue[];
}) {
  // Serialize args to hex
  const serializedArgs = functionArgs.map((arg) =>
    Buffer.from(serializeCV(arg)).toString("hex"),
  );

  const response = await fetch("/api/stacks", {
    method: "POST",
  });
}
