export default class GroupClient {
    constructor(xmtp) {
      // A mapping from some channel id to an array of addresses
      this.channelRegistered = false
      this.channelAddresses = new Set();
      this.xmtp = xmtp;
      this.address = this.xmtp.address;
      this.conversations = null;
      this.banned = new Set();
    }

    async join(address) {
      if (!this.channelRegistered) return

      console.log(`User ${address} has joined the chat`)

      this.channelAddresses.add(address)

      // Update conversations
      this.conversations = await this.xmtp.conversations.list()

      this.sendMessage(0, this.address, `User ${address} has joined the chat!`)
    }

    async leave(address) {
      if (!this.channelRegistered) return

      console.log(`User ${address} has left the chat`)

      this.channelAddresses.delete(address)

      // Update conversations
      this.conversations = await this.xmtp.conversations.list()

      this.sendMessage(0, this.address, `User ${address} has left the chat!`)
    }

    async sendMessage(senderAddress, message) {
      if (!this.channelRegistered) {
        console.log("returning line 40")
        return
      }

      // Send the incoming message to all participants in this channel

      // First check if sender is a chat room participant
      if (!this.channelAddresses.has(senderAddress)) {
        console.log("returning line 48")
        return
      }

      // Then check if member has been banned
      if (this.banned.has(senderAddress)) {
        console.log(`Ignoring message from banned user ${senderAddress}`)
        return
      }

      console.log(`Broadcasting message from ${senderAddress}`)

      if (this.channelAddresses.size === 0) {
        console.log("There are no channels registered")
        return
      }

      if (this.conversations) {
        // Current open conversations
        let conversationAddresses = this.conversations.map(conversation => conversation.peerAddress)
        
        this.conversations.forEach(async (conversation) => {
          if (senderAddress === conversation.peerAddress) {
            return;
          }

          // Reformat message text to include sender details
          let formattedMessage = message;
          if (senderAddress !== this.address) {
            let formattedMessage = `${senderAddress} said: ${message}`
          }
          
          await conversation.send(formattedMessage);
        })
      }
      
    }

    register() {
      console.log("Registering channel id")
      // For now, only a single channel can be registered
      if (this.channelRegistered) {
        console.log("A channel has already been registered. Only one channel is currently supported.")
        return
      }
      
      this.channelRegistered = true
    }

    ban(address) {
      if (!this.channelRegistered) return

      console.log(`Banning user ${address}`)
      this.banned.add(address)
    }

    unban(address) {
      if (!this.channelRegistered) return

      console.log(`Unbanning user ${address}`)
      this.banned.delete(address)
    }
  }