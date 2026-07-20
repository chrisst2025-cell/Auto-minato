const axios = require('axios');
module.exports.config = {
  name: 'gpt4o',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt4o'],
  description: "An AI command powered by GPT-4",
  usage: "Ai [promot]",
  credits: 'Metoushela Walker',
  cooldown: 3,
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const input = args.join(' ');
  if (!input) {
    api.sendMessage(`𝗚𝗣𝗧4𝗼 [🌐]\n━━━━━━━━━━━\n\n Please Provide a prompt.📃`, event.threadID, event.messageID);
    return;
  }
  
  try {
    const {
      data
    } = await axios.get(`https://metoushela-rest-api-tp5g.onrender.com/api/gpt4o?context=${encodeURIComponent(input)}`);
    const response = data.response;
    api.sendMessage('𝗚𝗣𝗧4𝗼 [🌐]\n━━━━━━━━━━━\n' + response + '\n ━━━━━━━━━━━', event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('🔴 An error occurred while processing your request..', event.threadID, event.messageID);
  }
};
