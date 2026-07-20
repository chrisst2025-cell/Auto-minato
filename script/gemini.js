const axios = require('axios');

module.exports.config = {
    name: "gemini",
    role: 0,
    credits: "aesther",
    description: "Interact with Gemini",
    hasPrefix: false,
    version: "1.0.0",
    aliases: ["gemini"],
    usage: "gemini [reply to photo]"
};

module.exports.run = async function ({ api, event, args }) {
    const prompt = args.join(" ");

    if (!prompt) {
        return api.sendMessage('This cmd only works in photo.', event.threadID, event.messageID);
    }

    if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
        return api.sendMessage('Please reply to a photo with this command.', event.threadID, event.messageID);
    }

    const url = encodeURIComponent(event.messageReply.attachments[0].url);
    api.sendTypingIndicator(event.threadID);

    try {
        await api.sendMessage('𝗚𝗘𝗠𝗜𝗡𝗜 {🌐}\n━━━━━━━━━━━\n Pose moi ta question', event.threadID);

        const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}&url=${url}`);
        const description = response.data.answer;

        return api.sendMessage(`𝗚𝗘𝗠𝗜𝗡𝗜 {🌐}\n━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage('❌ | An error occurred while processing your request.', event.threadID, event.messageID);
    }
};
