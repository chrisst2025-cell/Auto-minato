const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info', 'menu'],
  description: "ɢᴜɪᴅᴇ ᴅ'ᴀɪᴅᴇ ᴇᴛ ʟɪsᴛᴇ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs",
  usage: "help [page] ᴏᴜ [ᴄᴏᴍᴍᴀɴᴅᴇ]",
  credits: 'Chris st',
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

      let helpMessage = 
        `〔 🌸 ᴍᴇɴᴜ ᴅᴇs ᴊᴜᴛsᴜs 🌸 〕\n\n` +
        `┣ ʟɪsᴛᴇ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs :\n`;

      for (let i = start; i < Math.min(end, commands.length); i += 2) {
        const a = toSmallCaps(commands[i]);
        const b = commands[i + 1] && (i + 1 < Math.min(end, commands.length)) ? toSmallCaps(commands[i + 1]) : null;
        helpMessage += b ? `┣ ⌬ ${a.padEnd(12)} ⌬ ${b}\n` : `┣ ⌬ ${a}\n`;
      }

      helpMessage += `\n┣ ʟɪsᴛᴇ ᴅᴇs ᴇ́ᴠᴇ́ɴᴇᴍᴇɴᴛs :\n`;

      for (let i = 0; i < eventCommands.length; i += 2) {
        const a = toSmallCaps(eventCommands[i]);
        const b = eventCommands[i + 1] ? toSmallCaps(eventCommands[i + 1]) : null;
        helpMessage += b ? `┣ ⌬ ${a.padEnd(12)} ⌬ ${b}\n` : `┣ ⌬ ${a}\n`;
      }

      helpMessage += 
        `\n┣ ᴘᴀɢᴇ : ${page}/${Math.ceil(commands.length / pages)}\n` +
        `┣ ᴘʀᴇ́ꜰɪxᴇ ɢʟᴏʙᴀʟ : ${prefix}\n` +
        `┣ ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ : ᴄʜʀɪs sᴛ ☠️\n\n` +
        `〔 ᴛᴀᴘᴇᴢ '${prefix}help [ᴘᴀɢᴇ]' ᴏᴜ '${prefix}help [ᴄᴏᴍᴍᴀɴᴅᴇ]' 🍃 〕`;

      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;

      let helpMessage = 
        `〔 🍀 ᴍᴇɴᴜ ᴅᴇs ᴊᴜᴛsᴜs 🌴 〕\n\n` +
        `┣ ʟɪsᴛᴇ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs :\n`;

      for (let i = start; i < Math.min(end, commands.length); i += 2) {
        const a = toSmallCaps(commands[i]);
        const b = commands[i + 1] && (i + 1 < Math.min(end, commands.length)) ? toSmallCaps(commands[i + 1]) : null;
        helpMessage += b ? `┣ ⌬ ${a.padEnd(12)} ⌬ ${b}\n` : `┣ ⌬ ${a}\n`;
      }

      helpMessage += `\n┣ ʟɪsᴛᴇ ᴅᴇs ᴇ́ᴠᴇ́ɴᴇᴍᴇɴᴛs :\n`;

      for (let i = 0; i < eventCommands.length; i += 2) {
        const a = toSmallCaps(eventCommands[i]);
        const b = eventCommands[i + 1] ? toSmallCaps(eventCommands[i + 1]) : null;
        helpMessage += b ? `┣ ⌬ ${a.padEnd(12)} ⌬ ${b}\n` : `┣ ⌬ ${a}\n`;
      }

      helpMessage += 
        `\n┣ ᴘᴀɢᴇ : ${page}/${Math.ceil(commands.length / pages)}\n` +
        `┣ ᴘʀᴇ́ꜰɪxᴇ ɢʟᴏʙᴀʟ : ${prefix}\n` +
        `┣ ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ : ᴄʜʀɪs sᴛ ☠️\n\n` +
        `〔 ᴊᴇ sᴜɪs ᴘʀᴇ̂ᴛ ᴀ̀ ᴘʀᴏᴛᴇ́ɢᴇʀ ʟᴇ ᴠɪʟʟᴀɢᴇ ᴀ̀ ᴛᴇs ᴄᴏ̂ᴛᴇ́s 🍃 〕`;

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
          cooldown
        } = command;

        const roleMessage = role !== undefined ? (role === 0 ? 'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ' : (role === 1 ? 'ᴀᴅᴍɪɴ' : (role === 2 ? 'ᴀᴅᴍɪɴ ɢʀᴏᴜᴘᴇ' : (role === 3 ? 'sᴜᴘᴇʀ ᴀᴅᴍɪɴ' : '')))) : 'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ';

        const detailMsg =
          `〔 ✨ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴs ᴄᴏᴍᴍᴀɴᴅᴇ 🍁 〕\n\n` +
          `┣ ɴᴏᴍ : ${toSmallCaps(name)}\n` +
          `┣ ᴘᴇʀᴍɪssɪᴏɴ : ${roleMessage}\n` +
          `┣ ᴀʟɪᴀsᴇs : ${aliases.length ? aliases.join(', ') : 'ᴀᴜᴄᴜɴ'}\n` +
          `┣ ᴠᴇʀsɪᴏɴ : ${version || '1.0.0'}\n` +
          `┣ ᴄᴏᴏʟᴅᴏᴡɴ : ${cooldown ? cooldown + 's' : '0s'}\n` +
          `┣ ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ : ${toSmallCaps(credits) || 'ᴄʜʀɪs sᴛ'}\n\n` +
          `┣ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ : ${description || 'ᴀᴜᴄᴜɴᴇ'}\n` +
          `┣ ᴜᴛɪʟɪsᴀᴛɪᴏɴ : ${usage || name}\n\n` +
          `〔 ᴘʀᴇ̂ᴛ ᴀ̀ ᴘʀᴏᴛᴇ́ɢᴇʀ ʟᴇ ᴠɪʟʟᴀɢᴇ ᴀ̀ ᴛᴇs ᴄᴏ̂ᴛᴇ́s 🍃 〕`;

        api.sendMessage(detailMsg, event.threadID, event.messageID);
      } else {
        api.sendMessage(`❌ ᴄᴏᴍᴍᴀɴᴅᴇ "${input}" ɴᴏɴ ᴛʀᴏᴜᴠᴇ́ᴇ.`, event.threadID, event.messageID);
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

  const message = prefix 
    ? `〔 ⚙️ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ᴘʀᴇ́ꜰɪxᴇ 〕\n\n` +
      `┣ ᴘʀᴇ́ꜰɪxᴇ ɢʟᴏʙᴀʟ : ${prefix}\n` +
      `┣ ᴘʀᴇ́ꜰɪxᴇ ɪᴄɪ : ${prefix}\n\n` +
      `〔 ᴜᴛɪʟɪsᴇ ${prefix}prefix ᴘᴏᴜʀ ᴘʟᴜs ᴅᴇ ᴅᴇ́ᴛᴀɪʟs 🍃 〕`
    : "❌ ᴀᴜᴄᴜɴ ᴘʀᴇ́ꜰɪxᴇ ɴ'ᴇsᴛ ᴅᴇ́ꜰɪɴɪ.";

  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
};
   
