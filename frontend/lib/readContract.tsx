import {
  cvToJSON,
  deserializeCV,
  serializeCV,
  ClarityValue,
  cvToHex,
} from "@stacks/transactions";

interface ReadContractParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: ClarityValue[];
}

async function readContractOnce({
  contractAddress,
  contractName,
  functionName,
  functionArgs = [],
}: ReadContractParams) {
  //  Serialize each arg to hex string

  const serializedArgs = functionArgs.map((arg) => {
    //  cvToHex handles serialization cleanly
    const hex = cvToHex(arg);
    // cvToHex includes "0x" prefix, strip it
    return hex.startsWith("0x") ? hex.slice(2) : hex;
  });
  console.log("readContract calling:", functionName, "args:", serializedArgs);

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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (!data.okay) {
    throw new Error(data.cause ?? "Contract call failed");
  }

  //  Deserialize hex result
  const resultHex = data.result.startsWith("0x")
    ? data.result.slice(2)
    : data.result;

  const bytes = new Uint8Array(
    resultHex.match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16)),
  );

  const cv = deserializeCV(bytes);
  return cvToJSON(cv);
}

export async function readContract(
  params: ReadContractParams,
  retries = 3,
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await readContractOnce(params);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
