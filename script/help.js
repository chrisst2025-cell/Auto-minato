const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "help",
  version: "1.20",
  role: 0,
  hasPrefix: true,
  aliases: ["use", "cmdl", "info"],
  description: "Afficher l'utilisation et la liste des commandes",
  usage: "{pn} help [nomCmd]",
  credits: "chris",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args, prefix, role, Utils }) {
  const { threadID, messageID } = event;

  // Fonction utilitaire pour retrouver une commande via son nom ou alias
  function findCommand(cmdName) {
    if (!cmdName || !Utils?.commands) return null;
    const search = cmdName.toLowerCase();
    for (const [aliases, cmdData] of Utils.commands.entries()) {
      if (Array.isArray(aliases) && aliases.includes(search)) {
        return cmdData;
      }
    }
    return null;
  }

  // Convertisseur de rôle
  function roleTextToString(r) {
    const roleNum = Number(r);
    switch (roleNum) {
      case 0:
        return "0 (Tous les utilisateurs)";
      case 1:
        return "1 (Administrateurs du groupe)";
      case 2:
        return "2 (Administrateurs du Bot)";
      case 3:
        return "3 (Super Admin)";
      default:
        return `${r} (Utilisateur)`;
    }
  }

  try {
    // 1. AFFICHAGE DE LA LISTE PRINCIPALE DES COMMANDES
    if (args.length === 0) {
      const allCommands = [];
      
      if (Utils?.commands) {
        for (const cmdObj of Utils.commands.values()) {
          if (cmdObj && cmdObj.name) {
            if (cmdObj.role && Number(cmdObj.role) > Number(role)) continue;
            if (!allCommands.some(c => c.name === cmdObj.name)) {
              allCommands.push(cmdObj.name);
            }
          }
        }
      }

      allCommands.sort();

      let msg = "╔══════════════╗\n🔹 𝙼𝙸𝙽𝙰𝚃𝙾 𝙽𝙰𝙼𝙸𝚉𝙰𝙺𝙴 🔹\n╚══════════════╝\n";
      msg += `\n╭────────────⭓\n│『 LISTE DES COMMANDES 』`;
      
      allCommands.forEach((item) => {
        msg += `\n│𖤍 ${item}`;
      });
      
      msg += `\n╰────────⭓`;

      msg += `\n\n𝙰𝚌𝚝𝚞𝚎𝚕𝚕𝚎𝚖𝚎𝚗𝚝, 𝚖𝚒𝚗𝚊𝚝𝚘 à ${allCommands.length} 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚎𝚜 𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚋𝚕𝚎𝚜\n`;
      msg += `\n𝗧𝘆𝗽𝗲 ${prefix}𝚑𝚎𝚕𝚙 𝚗𝚘𝚖 𝚍𝚎 𝚕𝚊 𝚌𝚖𝚍 𝚙𝚘𝚞𝚛 𝚊𝚏𝚏𝚒𝚌𝚑𝚎𝚛 𝚕𝚎𝚜 𝚍é𝚝𝚊𝚒𝚕𝚜 𝚍𝚎 𝚌𝚎𝚝𝚝𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎\n`;
      msg += `\n🫧𝑩𝑶𝑻 𝑵𝑨𝑴𝑬🫧: 𝙼𝙸𝙽𝙰𝚃𝙾 𝙽𝙰𝙼𝙸𝙺𝙰𝚉𝙴⭕`;
      msg += `\n𓀬 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𓀬`;
      msg += `\n𝙁𝘽: https://www.facebook.com/profile.php?id=100094118835962`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // 2. DETAILS D'UNE COMMANDE SPÉCIFIQUE
    const commandName = args[0].toLowerCase();
    const command = findCommand(commandName);

    if (!command) {
      return api.sendMessage(`Commande "${commandName}" introuvable.`, threadID, messageID);
    }

    const roleText = roleTextToString(command.role ?? 0);
    const author = command.credits || "Inconnu";
    const desc = command.description || "Pas de description disponible";
    const aliasesList = Array.isArray(command.aliases) ? command.aliases.join(", ") : "Aucun";

    let rawUsage = command.usage || "{pn}";
    let usageFormatted = rawUsage
      .replace(/{p}/g, prefix)
      .replace(/{pn}/g, `${prefix}${command.name}`)
      .replace(/{n}/g, command.name);

    const response =
      `╭── 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 ────⭓\n` +
      `│ Nom: ${command.name}\n` +
      `├── 𝑰𝑵𝑭𝑶\n` +
      `│ 𝐷𝑒𝑠𝑐𝑟𝑖𝑝𝑡𝑖𝑜𝑛: ${desc}\n` +
      `│ 𝑂𝑡ℎ𝑒𝑟 𝑁𝑎𝑚𝑒: ${aliasesList}\n` +
      `│ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛: ${command.version || "1.0.0"}\n` +
      `│ 𝑅𝑜𝑙𝑒: ${roleText}\n` +
      `│ 𝑇𝑖𝑚𝑒 𝑃𝑒𝑟 𝐶𝑜𝑚𝑚𝑎𝑛𝑑: ${command.cooldown || 5}s\n` +
      `│ 𝐴𝑢𝑡ℎ𝑜𝑟: ${author}\n` +
      `├── 𝑼𝑺𝑨𝑮𝑬\n` +
      `│ ${usageFormatted}\n` +
      `├── 𝑵𝑶𝑻𝑬𝑺\n` +
      `│ 𝑇ℎ𝑒 𝑐𝑜𝑛𝑡𝑒𝑛𝑡 𝑖𝑛𝑠𝑖𝑑𝑒 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 𝑐𝑎𝑛 𝑏𝑒 𝑐ℎ𝑎𝑛𝑔𝑒𝑑\n` +
      `│ ♕︎ 𝐎𝐖𝐍𝐄𝐑 ♕︎:☠︎︎ 𝙼𝙸𝙽𝙰𝚃𝙾 𝚅𝟹 ☠︎︎\n` +
      `╰━━━━━━━❖`;

    return api.sendMessage(response, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("Une erreur est survenue lors de l'exécution de la commande help.", threadID, messageID);
  }
};

// EVENEMENT DÉCLENCHÉ QUAND UN UTILISATEUR ÉCRIT "prefix"
module.exports.handleEvent = async function ({ api, event, prefix }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body || body.toLowerCase() !== "prefix") return;

  try {
    let userName = "Utilisateur";
    try {
      const info = await api.getUserInfo(senderID);
      userName = info[senderID]?.name || "Utilisateur";
    } catch (e) {
      userName = "Utilisateur";
    }

    const botName = "🥷 𝙼𝚒𝚗𝚊𝚝𝚘 𝙽𝚊𝚖𝚒𝚔𝚊𝚣𝚎🌀";
    const currentPrefix = prefix || "!";

    // 🎨 Génération de l'image Canvas
    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    try {
      const bg = await loadImage("https://i.imgur.com/HwiR4cT.png");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      ctx.fillStyle = "#1e1e2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 40px Sans";
    ctx.textAlign = "center";
    ctx.fillText("MINATO PREFIX SYSTEM", canvas.width / 2, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Sans";

    ctx.fillText(`User: ${userName}`, canvas.width / 2, 170);
    ctx.fillText(`Prefix: ${currentPrefix}`, canvas.width / 2, 230);

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = now.toDateString();

    ctx.fillText(`Time: ${time}`, canvas.width / 2, 290);
    ctx.fillText(`Date: ${date}`, canvas.width / 2, 340);

    ctx.font = "italic 20px Sans";
    ctx.fillStyle = "#c084fc";
    ctx.fillText(`Powered by ${botName}`, canvas.width / 2, 420);

    const buffer = canvas.toBuffer();
    const folder = path.join(__dirname, "cache");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, `prefix_${senderID}.png`);
    fs.writeFileSync(filePath, buffer);

    const textMsg = 
      `〔 ʜᴇʏ ${userName}, ᴛᴜ ᴀs ʙᴇsᴏɪɴ ᴅᴇ ᴍᴏɴ sᴄᴇᴀᴜ ᴅᴇ ᴛᴇ́ʟᴇ́ᴘᴏʀᴛᴀᴛɪᴏɴ ‽ 〕\n\n` +
      `┣ ᴘʀᴇ́ꜰɪxᴇ ɪᴄɪ : ${currentPrefix}\n` +
      `┣ ᴍᴇɴᴜ ᴅᴇs ᴊᴜᴛsᴜs : ${currentPrefix}help\n` +
      `┣ ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ : ᴄʜʀɪs ☠️\n\n` +
      `〔 ᴊᴇ sᴜɪs ${botName}, ᴘʀᴇ̂ᴛ ᴀ̀ ᴘʀᴏᴛᴇ́ɢᴇʀ ʟᴇ ᴠɪʟʟᴀɢᴇ ᴀ̀ ᴛᴇs ᴄᴏ̂ᴛᴇ́s 🍃 〕`;

    api.sendMessage({
      body: textMsg,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (error) {
    console.error("Erreur dans handleEvent de help:", error);
  }
};
  
