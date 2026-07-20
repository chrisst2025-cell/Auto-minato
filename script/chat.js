const {
  Hercai
} = require('hercai');
const herc = new Hercai();
module.exports.config = {
  name: 'chat',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  description: "Un ia creer et developper par metoushela walker",
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
    api.sendMessage(`Salut Chers utilisateur Comment puis-je vous aider aujourd'hui?'`, event.threadID, event.messageID);
    return;
  }
  api.sendMessage(`Patientez Un Peu...`, event.threadID, event.messageID);
  try {
    const response = await herc.question({
      model: "v3",
      content: input
    });
    api.sendMessage(response.reply, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('Sorry 😅 An error occurred while processing your request.', event.threadID, event.messageID);
  }
};
