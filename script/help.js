const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

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
  name: "help",
  version: "1.18",
  role: 0,
  hasPrefix: true,
  aliases: ["use", "cmdl"],
  description: "View command usage and list all commands or commands by category",
  usage: "{pn} / help cmdName\n{pn} -c <categoryName>",
  credits: "chris",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args, prefix, role, threadsData, Utils, enableCommands }) {
  const { threadID, messageID } = event;
  const commandsMap = global.GoatBot ? global.GoatBot.commands : (Utils?.commands || new Map());
  const aliasesMap = global.GoatBot ? global.GoatBot.aliases : (Utils?.aliases || new Map());

  function roleTextToString(roleText) {
    switch (roleText) {
      case 0:
        return "0 (All users)";
      case 1:
        return "1 (Group administrators)";
      case 2:
        return "2 (Admin bot)";
      default:
        return "Unknown role";
    }
  }

  if (args.length === 0) {
    const categories = {};
    let msg = "";

    msg += "╔══════════════╗\n🔹 𝙼𝙸𝙽𝙰𝚃𝙾 𝙽𝙰𝙼𝙸𝙺𝙰𝚉𝙴 🔹\n╚══════════════╝\n";

    for (const [name, value] of commandsMap) {
      if (value.config.role > 1 && role < value.config.role) continue;

      const category = value.config.category || "Uncategorized";
      categories[category] = categories[category] || { commands: [] };
      categories[category].commands.push(name);
    }

    Object.keys(categories).forEach((category) => {
      if (category !== "info") {
        msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』`;

        const names = categories[category].commands.sort();
        names.forEach((item) => {
          msg += `\n│𖤍 ${item}`;
        });

        msg += `\n╰────────⭓`;
      }
    });

    const totalCommands = commandsMap.size || (commandsMap.length ? commandsMap.length : 0);
    msg += `\n𝙰𝚌𝚝𝚞𝚎𝚕𝚕𝚎𝚖𝚎𝚗𝚝,  𝚖𝚒𝚗𝚊𝚝𝚘 à ${totalCommands} 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚎𝚜 𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚋𝚕𝚎𝚜\n`;
    msg += `\n𝗧𝘆𝗽𝗲 ${prefix}𝚑𝚎𝚕𝚙 𝚗𝚘𝚖 𝚍𝚎 𝚕𝚊 𝚌𝚖𝚍  𝚙𝚘𝚞𝚛 𝚊𝚏𝚏𝚒𝚌𝚑𝚎𝚛 𝚕𝚎𝚜 𝚍é𝚝𝚊𝚒𝚕𝚜 𝚍𝚎 𝚌𝚎𝚝𝚝𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎\n`;
    msg += `\n🫧𝑩𝑶𝑻 𝑵𝑨𝑴𝑬🫧:𝙼𝙸𝙽𝙰𝚃𝙾 𝙽𝙰𝙼𝙸𝙺𝙰𝚉𝙴⭕`;
    msg += `\n𓀬 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𓀬`;
    msg += `\n 	 					`;
    msg += `\n𝙁𝘽:https://www.facebook.com/profile.php?id=100094118835962`;

    const helpListImages = [
      "https://i.ibb.co/Kgn10xG/684797258-1327405002818159-3504065921443860282-n-jpg-stp-dst-jpg-p480x480-tt6-nc-cat-109-ccb-1-7-n.jpg",
      "https://i.ibb.co/HT4Hk6SF/649666902-1547549473009164-5960445224328660848-n-jpg-stp-dst-jpg-p480x480-tt6-nc-cat-104-ccb-1-7-n.jpg",
      "https://i.ibb.co/HTjs925j/685155293-936519109213674-2388955215511618307-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-105-ccb-1-7-nc.jpg",
      "https://i.ibb.co/svXBgxw2/516688787-1388605512441969-5696309895683148133-n-jpg-stp-dst-jpg-p480x480-tt6-nc-cat-107-ccb-1-7-n.jpg",
      "https://i.ibb.co/0HkWH81/691200995-2775407616149485-9104723335245991500-n-gif-nc-cat-106-ccb-1-7-nc-sid-cf94fc-nc-eui2-Ae-E.gif",
      "https://i.ibb.co/VYLq0rX3/495047004-2156248254796411-1328262576645206658-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-108-ccb-1-7-n.jpg",
      "https://i.ibb.co/rTMN49m/686398590-1537926281285123-3076869716863077899-n-jpg-stp-dst-jpg-p480x480-tt6-nc-cat-102-ccb-1-7-n.jpg"
    ];

    const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

    api.sendMessage(msg, threadID, messageID);

  } else if (args[0] === "-c") {
    if (!args[1]) {
      api.sendMessage("Please specify a category name.", threadID, messageID);
      return;
    }

    const categoryName = args[1].toLowerCase();
    const filteredCommands = Array.from(commandsMap.values()).filter(
      (cmd) => cmd.config?.category?.toLowerCase() === categoryName
    );

    if (filteredCommands.length === 0) {
      api.sendMessage(`No commands found in the category "${categoryName}".`, threadID, messageID);
      return;
    }

    let msg = `╔══════════════╗\n༒︎ ${categoryName.toUpperCase()} COMMANDS ༒︎\n╚══════════════╝\n`;

    filteredCommands.forEach((cmd) => {
      msg += `\n☠︎︎ ${cmd.config.name} `;
    });

    api.sendMessage(msg, threadID, messageID);

  } else {
    const commandName = args[0].toLowerCase();
    const command = commandsMap.get ? (commandsMap.get(commandName) || commandsMap.get(aliasesMap.get(commandName))) : null;

    if (!command) {
      api.sendMessage(`Command "${commandName}" not found.`, threadID, messageID);
    } else {
      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || configCommand.credits || "Unknown";

      const longDescription = configCommand.longDescription
        ? (configCommand.longDescription.en || configCommand.longDescription)
        : (configCommand.description || "No description");

      const guideBody = configCommand.guide?.en || configCommand.usage || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      const response = 
        `╭── 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 ────⭓\n` +
        `│ ${configCommand.name}\n` +
        `├── 𝑰𝑵𝑭𝑶\n` +
        `│ 𝐷𝑒𝑠𝑐𝑟𝑖𝑝𝑡𝑖𝑜𝑛: ${longDescription}\n` +
        `│ 𝑂𝑡ℎ𝑒𝑟 𝑁𝑎𝑚𝑒: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}\n` +
        `│ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛: ${configCommand.version || "1.0"}\n` +
        `│ 𝑅𝑜𝑙𝑒: ${roleText}\n` +
        `│ 𝑇𝑖𝑚𝑒 𝑃𝑒𝑟 𝐶𝑜𝑚𝑚𝑎𝑛𝑑: ${configCommand.countDown || configCommand.cooldown || 1}s\n` +
        `│ 𝐴𝑢𝑡ℎ𝑜𝑟: ${author}\n` +
        `├── 𝑼𝑺𝑨𝑮𝑬\n` +
        `│ ${usage}\n` +
        `├── 𝑵𝑶𝑻𝑬𝑺\n` +
        `│ 𝑇ℎ𝑒 𝑐𝑜𝑛𝑡𝑒𝑛𝑡 𝑖𝑛𝑠𝑖𝑑𝑒 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 𝑐𝑎𝑛 𝑏𝑒 𝑐ℎ𝑎𝑛𝑔𝑒𝑑\n` +
        `│ ♕︎ 𝐎𝐖𝐍𝐄𝐑 ♕︎:☠︎︎ 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 ☠︎︎\n` +
        `╰━━━━━━━❖`;

      api.sendMessage(response, threadID, messageID);
    }
  }
};
        
