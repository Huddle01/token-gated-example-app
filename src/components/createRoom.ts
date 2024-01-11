"use server";

interface CreateRoomProps {
  tokenGateWith: string;
  chain: string;
  contractAddress: string;
}

export const createRoom = async ({
  tokenGateWith,
  chain,
  contractAddress,
}: CreateRoomProps) => {
  const response = await fetch("https://api.huddle01.com/api/v1/create-room", {
    method: "POST",
    body: JSON.stringify({
      title: "Huddle01 Room",
      tokenType: tokenGateWith,
      chain: chain,
      contractAddress: [contractAddress],
    }),
    headers: {
      "Content-type": "application/json",
      "x-api-key": process.env.API_KEY!,
    },
    cache: "no-cache",
  });
  const data = await response.json();
  const { roomId } = await data.data;
  return roomId;
};
