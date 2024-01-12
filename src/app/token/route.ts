import { ethereumPublicClient, polygonPublicClient } from "@/utils/config";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { roomId, signature, address, expirationTime, message } =
    await request.json();

  if (!roomId || !signature || !address) {
    return new Response("Incorrect request", { status: 400 });
  }

  if (expirationTime < Date.now()) {
    return new Response("Signature expired", { status: 400 });
  }

  const roomDetailsResponse = await fetch(
    `https://api.huddle01.com/api/v1/room-details/${roomId}`,
    {
      headers: {
        "x-api-key": process.env.API_KEY!,
      },
    }
  );

  const roomDetails = await roomDetailsResponse.json();

  if (!roomDetails?.tokenGatingInfo) {
    return new Response("Room is not token gated", { status: 400 });
  }

  const publicClient =
    roomDetails.tokenGatingInfo.tokenGatingConditions[0].chain === "ETHEREUM"
      ? ethereumPublicClient
      : polygonPublicClient;

  const verify = await publicClient.verifyMessage({
    address,
    message,
    signature,
  });

  if (verify) {
    const contractResponse = await publicClient.readContract({
      address:
        roomDetails.tokenGatingInfo.tokenGatingConditions[0].contractAddress,
      abi: [
        {
          inputs: [{ name: "owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [address],
    });
    const balance = Number(contractResponse);

    if (balance < 1) {
      return new Response("You don't hold token to join this room", {
        status: 400,
      });
    } else {
      const accessToken = new AccessToken({
        apiKey: process.env.API_KEY!,
        roomId: roomId as string,
        role: Role.HOST,
        permissions: {
          admin: true,
          canConsume: true,
          canProduce: true,
          canProduceSources: {
            cam: true,
            mic: true,
            screen: true,
          },
          canRecvData: true,
          canSendData: true,
          canUpdateMetadata: true,
        },
      });

      const token = await accessToken.toJwt();
      return new Response(token, { status: 200 });
    }
  } else {
    return new Response("Incorrect signature", { status: 400 });
  }
}
