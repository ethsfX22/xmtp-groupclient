import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", async (req: Request, res: Response) => {
  // You'll want to replace this with a wallet from your application
  const wallet = Wallet.createRandom();
  // Create the client with your wallet. This will connect to the XMTP development network by default
  const xmtp = await Client.create(wallet);
  // Start a conversation with XMTP
  const conversation = await xmtp.conversations.newConversation(
    "0x384CAB9F073ecd19359c9e98380497D1341d5Dc1"
  );
  // Load all messages in the conversation
  const messages = await conversation.messages();
  // Send a message
  await conversation.send("gm");
  // Listen for new messages in the conversation
  for await (const message of await conversation.streamMessages()) {
    console.log(`[${message.senderAddress}]: ${message.content}`);
  }

  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
