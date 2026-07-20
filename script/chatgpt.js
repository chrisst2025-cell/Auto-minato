const {
  Hercai
} = require('hercai');
const herc = new Hercai();
module.exports.config = {
  name: 'chatgpt',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  description: "An AI command powered by Hercai",
  usage: "hercai [prompt]",
  credits: 'Metoushela',
  cooldown: 3,
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const input = args.join(' ');
  if (!input) {
    api.sendMessage(`𝙊𝙥𝙚𝙣𝙖𝙞 [🌐]\n━━━━━━━━━━━\n\nPlease Provide a prompt.📃`, event.threadID, event.messageID);
    return;
  }
  
  try {
    const response = await herc.question({
      model: "v3",
      content: input
    });
    api.sendMessage('𝙊𝙥𝙚𝙣𝙖𝙞 [🌐]/n/n' + response.reply, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
  }
};
