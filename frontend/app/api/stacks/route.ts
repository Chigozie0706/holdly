import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      contractAddress,
      contractName,
      functionName,
      functionArgs = [],
    } = await req.json();

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

    const text = await response.text();

    if (!response.ok) {
      console.error("Hiro API error:", response.status, text);
      return NextResponse.json(
        { error: "Hiro API error", status: response.status, body: text },
        { status: response.status },
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 },
    );
  }
}
