import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
      try {
            const { contractAddress, contractName, functionName, functionArgs } =
      await req.json();
    const url = `https://api.mainnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

      }
}
