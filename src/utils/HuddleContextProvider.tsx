"use client";

import dynamic from "next/dynamic";
import React from "react";
import { HuddleClient, HuddleProvider } from "@huddle01/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config";

const Toaster = dynamic(
  () => import("react-hot-toast").then((m) => m.Toaster),
  {
    ssr: false,
  }
);

type ToasterProps = {
  children: React.ReactNode;
};

const HuddleContextProvider: React.FC<ToasterProps> = ({ children }) => {
  const huddleClient = new HuddleClient({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <HuddleProvider client={huddleClient}>
          {children}
          <Toaster
            position="bottom-right"
            containerStyle={{
              bottom: "70px",
              animation: "ease-in-out",
              animationFillMode: "forwards",
            }}
            toastOptions={{
              style: {
                padding: "1.2rem 1rem",
              },
              duration: 5000,
              success: {
                style: {
                  border: "1px solid #3CCB7F",
                  backgroundColor: "#121214",
                  color: "#3CCB7F",
                },
              },
              error: {
                style: {
                  border: "1px solid #F87171",
                  background: "black",
                  color: "#F87171",
                },
              },
            }}
          />
        </HuddleProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
export default HuddleContextProvider;
