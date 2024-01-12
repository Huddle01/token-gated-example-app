"use client";

import RemotePeer from "@/components/RemotePeer/RemotePeer";
import {
  useLocalAudio,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { config } from "@/utils/config";
import { useSignMessage } from "wagmi";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function Room({ params }: { params: { roomId: string } }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { address } = useAccount();
  const [expirationTime, setExpirationTime] = useState(0);
  const [message, setMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const { joinRoom, leaveRoom, state } = useRoom({
    onLeave: () => {
      window.location.reload();
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { peerIds } = usePeerIds();
  const { signMessageAsync } = useSignMessage({
    config: config,
    mutation: {
      onSuccess: (data) => {
        authenticateUser(data);
      },
    },
  });

  const authenticateUser = async (signature: string) => {
    console.log("account", address);
    try {
      const tokenResponse = await fetch("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature,
          address,
          message,
          expirationTime,
          roomId: params.roomId,
        }),
      });
      const token = await tokenResponse.text();
      if (state === "idle")
        await joinRoom({
          roomId: params.roomId,
          token,
        });
    } catch (e) {
      toast.error("Authentication failed");
    }
  };

  useEffect(() => {
    setIsLoaded(true);
  }, [isLoaded]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  return (
    <>
      {isLoaded && (
        <main
          className={`flex min-h-screen flex-col items-center p-4 ${inter.className}`}
        >
          <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
            <p className="fixed left-0 top-0 flex w-full justify-center border-b bg-gradient-to-b pb-6 pt-8 backdrop-blur-2xl border-neutral-800 bg-zinc-800/30 from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4 lg:bg-zinc-800/30">
              <code className="font-mono font-bold">{state}</code>
            </p>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
              {state === "idle" && (
                <button
                  type="button"
                  className="bg-blue-500 p-2 mx-2 rounded-lg"
                  onClick={async () => {
                    const time = {
                      issuedAt: Date.now(),
                      expiresAt: Date.now() + 1000 * 60 * 5,
                    };
                    const msg = `Click "Sign" only means you have proved this wallet is owned by you.
We will use the public wallet address to fetch your NFTs.
This request will not trigger any blockchain transaction or cost of any gas fees.
                    
Account: ${address}
                    
Issued At: ${new Date(time.issuedAt).toLocaleString()}
                    
Expires At: ${new Date(time.expiresAt).toLocaleString()}`;
                    setExpirationTime(time.expiresAt);
                    setMessage(msg);
                    await signMessageAsync({
                      message: msg,
                    });
                  }}
                >
                  Sign In with Wallet
                </button>
              )}

              {state === "connected" && (
                <>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      isVideoOn ? await disableVideo() : await enableVideo();
                    }}
                  >
                    {isVideoOn ? "Disable Video" : "Enable Video"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      isAudioOn ? await disableAudio() : await enableAudio();
                    }}
                  >
                    {isAudioOn ? "Disable Audio" : "Enable Audio"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={async () => {
                      shareStream
                        ? await stopScreenShare()
                        : await startScreenShare();
                    }}
                  >
                    {shareStream ? "Disable Screen" : "Enable Screen"}
                  </button>
                  <button
                    className="bg-blue-500 p-2 mx-2 rounded-lg"
                    onClick={leaveRoom}
                  >
                    Leave Room
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="w-full mt-8 flex gap-4 justify-between items-stretch">
            <div className="flex-1 justify-between items-center flex flex-col">
              <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:blur-2xl after:content-[''] before:bg-gradient-to-br before:from-transparent before:to-blue-700/10 after:from-sky-900 after:via-[#0141ff]/40 before:lg:h-[360px]">
                <div className="relative flex gap-2">
                  {isVideoOn && (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={videoRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                  {shareStream && (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={screenRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 mb-32 grid gap-2 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                {peerIds.map((peerId) =>
                  peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
