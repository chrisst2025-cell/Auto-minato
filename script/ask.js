const {
  Hercai
} = require('hercai');
const herc = new Hercai();
module.exports.config = {
  name: 'ask',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  description: "An AI command powered by Hercai",
  usage: "ai [prompt]",
  credits: 'Developer',
  cooldown: 3,
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const input = args.join(' ');
  if (!input) {
    api.sendMessage(`⚘𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁⊰♔⊱\n\n⊰⊹⊱♡⊰⊹⊱♡⊰⊹⊱♡⊰⊹\nHey salut! Belle journée, pas vrai ? Pose ta question 💭, je serai ravie de t'aider.💜✏\n╰┈➤⊹⊱✫⊰⊹⊱✫⊰🍀`, event.threadID, event.messageID);
    return;
  }
  try {
    const response = await herc.question({
      model: "v3",
      content: input
    });
    api.sendMessage('⚘𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁⊰♔⊱\n\n⊰⊹⊱♡⊰⊹⊱♡⊰⊹⊱♡⊰⊹\n' + response.reply, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('🔥(｡>﹏<｡)🔥😓 Sorry An error 502.', event.threadID, event.messageID);
  }
};
