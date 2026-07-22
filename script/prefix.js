const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "prefix",
  version: "1.4",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Modifier le préfixe + affichage canvas stylé",
  usage: "prefix <nouveau préfixe> | prefix reset | prefix <nouveau préfixe> -g",
  credits: "Chris",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, role, threadsData, prefix }) {
  const { threadID, messageID, senderID } = event;

  if (!args[0]) {
    return api.sendMessage(
      `{pn} <nouveau préfixe>\n` +
      `{pn} <nouveau préfixe> -g\n` +
      `{pn} reset\n` +
      `Écris juste prefix → affiche les infos`,
      threadID,
      messageID
    );
  }

  const defaultPrefix = global.GoatBot?.config?.prefix || prefix || "!";

  if (args[0] === "reset") {
    const botID = global.botID || api.getCurrentUserID();
    if (threadsData && typeof threadsData.set === "function") {
      await threadsData.set(threadID, null, `data.prefix_${botID}`);
      await threadsData.set(threadID, null, "data.prefix");
    }
    return api.sendMessage(`⚡ ʟᴇ ᴘʀᴇ́ғɪxᴇ ᴀ ᴇ́ᴛᴇ́ ʀᴇ́ɪɴɪᴛɪᴀʟɪsᴇ́ : ${defaultPrefix}`, threadID, messageID);
  }

  const newPrefix = args[0];
  const isGlobal = args[1] === "-g";

  if (isGlobal && role < 2) {
    return api.sendMessage("❌ sᴇᴜʟ ᴜɴ ʜᴏᴋᴀɢᴇ (ᴀᴅᴍɪɴ) ᴘᴇᴜᴛ ᴍᴏᴅɪғɪᴇʀ", threadID, messageID);
  }

  const confirmMsg = isGlobal
    ? "⚠️ ʀᴇ́ᴀɢɪs ᴘᴏᴜʀ ᴄᴏɴғɪʀᴍᴇʀ (ɢʟᴏʙᴀʟ)"
    : "⚠️ ʀᴇ́ᴀɢɪs ᴘᴏᴜʀ ᴄᴏɴғɪʀᴍᴇʀ (ɢʀᴏᴜᴘᴇ)";

  api.sendMessage(confirmMsg, threadID, (err, info) => {
    if (err) return;
    const formSet = {
      commandName: this.config.name,
      author: senderID,
      newPrefix,
      setGlobal: isGlobal,
      messageID: info.messageID
    };

    if (global.GoatBot && global.GoatBot.onReaction) {
      global.GoatBot.onReaction.set(info.messageID, formSet);
    } else if (global.client && global.client.handleReaction) {
      global.client.handleReaction.push({
        messageID: info.messageID,
        author: senderID,
        newPrefix,
        setGlobal: isGlobal
      });
    }
  }, messageID);
};

module.exports.handleReaction = async function ({ api, event, Reaction, handleReaction, threadsData }) {
  const data = Reaction || handleReaction;
  if (!data) return;

  const { author, newPrefix, setGlobal } = data;
  if (event.userID !== author) return;

  if (setGlobal) {
    if (global.GoatBot && global.GoatBot.config) {
      global.GoatBot.config.prefix = newPrefix;
    }
    if (global.client && global.client.dirConfig) {
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot?.config || {}, null, 2));
    }
    return api.sendMessage(`✅ ᴘʀᴇ́ғɪxᴇ sʏsᴛᴇ̀ᴍᴇ ᴍᴏᴅɪғɪᴇ́ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s : ${newPrefix}`, event.threadID, event.messageID);
  } else {
    const botID = global.botID || api.getCurrentUserID();
    if (threadsData && typeof threadsData.set === "function") {
      await threadsData.set(event.threadID, newPrefix, `data.prefix_${botID}`);
    }
    return api.sendMessage(`✅ ᴘʀᴇ́ғɪxᴇ ᴅᴇ ᴄᴇ ɢʀᴏᴜᴘᴇ ᴍᴏᴅɪғɪᴇ́ : ${newPrefix}. ʟᴇ sᴄᴇᴀᴜ ᴇsᴛ ᴘʟᴀᴄᴇ́ !`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, prefix, usersData }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body || body.toLowerCase() !== "prefix") return;

  try {
    let userName = "Utilisateur";
    if (usersData && typeof usersData.getName === "function") {
      userName = await usersData.getName(senderID);
    } else if (api.getUserInfo) {
      const info = await api.getUserInfo(senderID);
      userName = info[senderID]?.name || "Utilisateur";
    }

    const botName = "🥷 𝙼𝚒𝚗𝚊𝚝𝚘 𝚔𝚊𝚖𝚒𝚔𝚊𝚣𝚎🌀";
    const globalPrefix = global.GoatBot?.config?.prefix || "!";
    const threadPrefix = prefix || globalPrefix;

    // 🎨 Canvas
    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    const bg = await loadImage("https://i.imgur.com/HwiR4cT.png");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 40px Sans";
    ctx.textAlign = "center";
    ctx.fillText("MINATO PREFIX SYSTEM", canvas.width / 2, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Sans";

    ctx.fillText(`User: ${userName}`, canvas.width / 2, 160);
    ctx.fillText(`Global: ${globalPrefix}`, canvas.width / 2, 210);
    ctx.fillText(`Here: ${threadPrefix}`, canvas.width / 2, 260);

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    const date = now.toDateString();

    ctx.fillText(`Time: ${time}`, canvas.width / 2, 310);
    ctx.fillText(`Date: ${date}`, canvas.width / 2, 360);

    ctx.font = "italic 20px Sans";
    ctx.fillStyle = "#c084fc";
    ctx.fillText(`Powered by ${botName}`, canvas.width / 2, 430);

    const buffer = canvas.toBuffer();
    const folder = path.join(__dirname, "cache");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, `prefix_${senderID}.png`);
    fs.writeFileSync(filePath, buffer);

    const textMsg = 
      `〔 ʜᴇʏ ${userName}, ᴛᴜ ᴀs ʙᴇsᴏɪɴ ᴅᴇ ᴍᴏɴ sᴄᴇᴀᴜ ᴅᴇ ᴛᴇ́ʟᴇ́ᴘᴏʀᴛᴀᴛɪᴏɴ ‽ 〕 \n\n` +
      `┣ ᴘʀᴇ́ꜰɪxᴇ ɢʟᴏʙᴀʟ : ${globalPrefix}\n` +
      `┣ ᴘʀᴇ́ꜰɪxᴇ ɪᴄɪ : ${threadPrefix}\n` +
      `┣ ᴍᴇɴᴜ ᴅᴇs ᴊᴜᴛsᴜs : ʜᴇʟᴘ\n` +
      `┣ ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ : ᴄʜʀɪs ☠️\n\n` +
      `〔 ᴊᴇ sᴜɪs ${botName}, ᴘʀᴇ̂ᴛ ᴀ̀ ᴘʀᴏᴛᴇ́ɢᴇʀ ʟᴇ ᴠɪʟʟᴀɢᴇ ᴀ̀ ᴛᴇs ᴄᴏ̂ᴛᴇ́s 🍃 〕`;

    api.sendMessage({
      body: textMsg,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (error) {
    console.error(error);
  }
};
