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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contractAddress,
      contractName,
      functionName,
      functionArgs: serializedArgs,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();

  // Hiro returns { okay: true, result: "0x..." }

  if (!data.okay)
}
