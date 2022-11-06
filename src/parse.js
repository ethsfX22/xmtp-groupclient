// @ts-nocheck

// Parse incoming messages
export function parseMessage(message) {
    // Parse as JSON and extract message type and text (if present)
    let messageContent = message.content

    try {
        let parsedMessageContent = JSON.parse(messageContent)
        console.log("Successfully parsed")
        let type = parsedMessageContent.type
        let data = parsedMessageContent.data

        return [type, data]

    } catch(e) {
        console.log("Could not parse message as json - treating message as plaintext!")

        // Need to broadcast message as is to participants
        return ["plaintext", messageContent]
    }

}