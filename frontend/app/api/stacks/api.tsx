import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { contractAddress, contractName, functionName, functionArgs } =
      await req.json();
    const url = `https://api.mainnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: contractAddress,
        arguments: functionArgs,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Hiro API error",
          status: response.status,
        },
        { status: response.status },
      );
    }
  } catch {}
}
