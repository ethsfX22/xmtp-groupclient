// @ts-nocheck
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";

import { parseMessage } from './parse'

import GroupClient from './GroupClient'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

async function handleConversations(XMTPGroupClient) {
  const stream = await XMTPGroupClient.xmtp.conversations.streamAllMessages()
  for await (const message of stream) {
    if (message.senderAddress === XMTPGroupClient.xmtp.address) {
      // This message was sent from me
      continue
    }

    console.log(`[${message.senderAddress}]: ${message.content}`);
    const [type, data] = parseMessage(message)

    switch(type) {
      case "join":
        // This is a request to join a chatroom
        // The recipient address needs to be recorded and added to a channel group corresopnding to the channel_id in the data object
        XMTPGroupClient.join(message.senderAddress)
        break;
      case "leave":
        // This is a request to leave a chatroom
        // The recipient address needs to be removed from the  and added to a channel group corresopnding to the channel_id in the data object
        XMTPGroupClient.join(message.senderAddress)
        break;
      case "register":
        // This message type should ONLY be called by games who want to register onto the GameChat network
        XMTPGroupClient.register()
        break;
      case "ban":
        // Ban a user
        XMTPGroupClient.ban(data.address)
        break;
      case "unban":
        // Unban a user
        XMTPGroupClient.unban(data.address)
        break;
      default:
        // Treat message as plaintext
        await XMTPGroupClient.sendMessage(message.senderAddress, data)
        break;
      }
  }
}

app.get("/", async (req: Request, res: Response) => {
  // Generate wallet for groupclient
  const wallet = Wallet.createRandom();

  // Create the client with your wallet. This will connect to the XMTP development network by default
  const xmtp = await Client.create(wallet);
  console.log("xmtp group client address is: ", xmtp.address)

  // Initialize GroupClient
  const XMTPGroupClient = new GroupClient(xmtp);

  handleConversations(XMTPGroupClient)
  res.send("XMTP Group Client has been started!");

});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});