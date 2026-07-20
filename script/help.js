module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'ℳℰ𝒯ᎾUЅℋℰℒᎯ',
};
module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix
}) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;
    if (!input) {
      const pages = 20;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = ` ⋆☾⋆⁺₊✧ℂℳⅅ ℒℐЅ𝒯✩ ♬ ₊.:\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `\t${i + 1}. ⋆☾⋆⁺₊✧ ${prefix}${commands[i]} ✩ ♬ ₊\n`;
      }
      helpMessage += '˖ ࣪ ᪥ℰᏉℰℕ𝒯 ℒℐЅ𝒯𐀔 𓂃:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t${index + 1}. ✩ ♬ ₊ ${prefix}${eventCommand} ⋆☾⋆⁺₊✧\n`;
      });
      helpMessage += `\n𝗣𝗮𝗴𝗲 ${page}/${Math.ceil(commands.length / pages)}. tꭴ ꝟꭵꬲꝡ tꜧꬲ ꝴꬲꭗt ꝓagꬲ, tꝩꝓꬲ '${prefix}𝗵𝗲𝗹𝗽 ꝓagꬲ ꝴuꝳ𝗯ꬲꞧ'. 𝗧𝗼 𝗩𝗶𝗲𝘄 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝐀𝐁𝐎𝐔𝐓 𝐀 𝘀𝗽𝗲𝗰𝗶𝗳𝗶𝗰 𝗰𝗼𝗺𝗺𝗮𝗻𝗱, 𝘁𝘆𝗽𝗲. '${prefix}𝗵𝗲𝗹𝗽 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗻𝗮𝗺𝗲✩ ♬`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = ` ⋆☾⋆⁺₊✧ℂℳⅅ ℒℐЅ𝒯✩ ♬ ₊.:\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `\t${i + 1}. ⋆☾⋆⁺₊✧ ${prefix}${commands[i]} ✩ ♬ ₊\n`;
      }
      helpMessage += '˖ ࣪ ᪥᪥ℰᏉℰℕ𝒯 ℒℐЅ𝒯𐀔 𓂃:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t${index + 1}.✩ ♬ ₊.${prefix}${eventCommand} ⋆☾⋆⁺₊✧\n`;
      });
      helpMessage += `\n𝗣𝗔𝗚𝗘 ${page} of ${Math.ceil(commands.length / pages)}\nᏇ𝒯 ℂℛℰᎯ𝒯ℰ 𝗬𝗢𝗨𝗥 𝗢𝗪𝗡 𝗕𝗢𝗧 ℋℰℛℰ\n https://educational-bot-v2-0-1.vercel.app/`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else {
      const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) => key.includes(input?.toLowerCase()))?.[1];
      if (command) {
        const {
          name,
          version,
          role,
          aliases = [],
          description,
          usage,
          credits,
          cooldown,
          hasPrefix
        } = command;
        const roleMessage = role !== undefined ? (role === 0 ? '➛ Permission: user' : (role === 1 ? '➛ Permission: admin' : (role === 2 ? '➛ Permission: thread Admin' : (role === 3 ? '➛ Permission: super Admin' : '')))) : '';
        const aliasesMessage = aliases.length ? `➛ Aliases: ${aliases.join(', ')}\n` : '';
        const descriptionMessage = description ? `Description: ${description}\n` : '';
        const usageMessage = usage ? `➛ Usage: ${usage}\n` : '';
        const creditsMessage = credits ? `➛ Credits: ${credits}\n` : '';
        const versionMessage = version ? `➛ Version: ${version}\n` : '';
        const cooldownMessage = cooldown ? `➛ Cooldown: ${cooldown} second(s)\n` : '';
        const message = ` 「 Command 」\n\n➛ Name: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage('Command not found.', event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const { threadID, messageID, body } = event;

  // Message personnalisé pour le préfixe
  const message = prefix 
    ? `⚙️ System prefix: ${prefix}\n👑 Your chatbox prefix: ${prefix}`
    : "⚙️ No prefix is currently set.";

  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
};
