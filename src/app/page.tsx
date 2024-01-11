"use client";

import { Input } from "@/components/ui/input";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createRoom } from "@/components/createRoom";
import { useRouter } from "next/navigation";


export default function Home() {
  const [tokenGateWith, setTokenGateWith] = useState("ERC20");
  const [chain, setChain] = useState("ETHEREUM");
  const [contractAddress, setContractAddress] = useState("");
  const router = useRouter();

  const createTokenGatedRoom = async () => {
    const roomId = await createRoom({
      tokenGateWith,
      chain,
      contractAddress,
    });
    if (roomId) {
      router.push(`/${roomId}`);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="bg-[#1A1A1A] p-8 rounded-lg max-w-md mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">
          Create Token Gated Room
        </h1>
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="font-medium text-gray-300 mb-2">
              Token Gate With
            </legend>
            <RadioGroup defaultValue={tokenGateWith}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  id="erc20"
                  value="ERC20"
                  onClick={() => setTokenGateWith("ERC20")}
                />
                <Label className="text-gray-300" htmlFor="erc20">
                  ERC20
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  id="erc721"
                  value="ERC721"
                  onClick={() => setTokenGateWith("ERC721")}
                />
                <Label className="text-gray-300" htmlFor="erc721">
                  ERC721
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  id="erc1155"
                  value="ERC1155"
                  onClick={() => setTokenGateWith("ERC1155")}
                />
                <Label className="text-gray-300" htmlFor="erc1155">
                  ERC1155
                </Label>
              </div>
            </RadioGroup>
          </fieldset>
          <label className="font-medium text-gray-300" htmlFor="select-chain">
            Select Chain
          </label>
          <Select onValueChange={(value) => setChain(value)}>
            <SelectTrigger id="select-chain">
              <SelectValue placeholder="Ethereum" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ETHEREUM">Ethereum</SelectItem>
              <SelectItem value="POLYGON">Polygon</SelectItem>
            </SelectContent>
          </Select>
          <label
            className="font-medium text-gray-300"
            htmlFor="contract-address"
          >
            Contract Address
          </label>
          <Input
            id="contract-address"
            placeholder="Enter Contract Address"
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <Button
            className="mt-4 bg-blue-600 text-white hover:bg-blue-600/50"
            onClick={createTokenGatedRoom}
          >
            Create Room
          </Button>
        </div>
      </Card>
    </div>
  );
}
