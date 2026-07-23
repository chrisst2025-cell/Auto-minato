const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "2.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["pin"],
  description: "Rechercher des images sur Pinterest",
  usage: "{pn} <requête> [-n ou -r]",
  credits: "SIFAT (adapté par Chris)",
  countDown: 10
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID, senderID } = event;

  let count = 6;
  let random = false;

  const countArg = args.find(a => /^-\d+$/.test(a));
  const randomArg = args.find(a => a === "-r");

  if (countArg) {
    count = Math.min(parseInt(countArg.slice(1), 10), 25);
    args = args.filter(a => a !== countArg);
  }
  if (randomArg) {
    random = true;
    args = args.filter(a => a !== randomArg);
  }

  const query = args.join(" ").trim();
  if (!query) {
    return api.sendMessage(
      `⌀ ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ꜱᴇᴀʀᴄʜ ǫᴜᴇʀʏ\nExemple : ${prefix}pinterest minato`,
      threadID,
      messageID
    );
  }

  const waitMsg = await api.sendMessage("◈ ꜱᴇᴀʀᴄʜɪɴɢ ᴘɪɴᴛᴇʀᴇꜱᴛ...", threadID);

  try {
    const res = await axios.get(`https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=90`, {
      timeout: 15000
    });
    const allImageUrls = res.data.results || [];

    if (waitMsg && waitMsg.messageID) {
      api.unsend(waitMsg.messageID).catch(() => {});
    }

    if (!allImageUrls.length) {
      return api.sendMessage(`⌀ ɴᴏ ɪᴍᴀɢᴇꜱ ꜰᴏᴜɴᴅ ꜰᴏʀ "${query}"`, threadID, messageID);
    }

    let pool = random ? allImageUrls.sort(() => Math.random() - 0.5) : allImageUrls;
    const urls = pool.slice(0, count);

    const folderPath = path.join(__dirname, "cache");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const attachments = [];
    const filePaths = [];

    for (let i = 0; i < urls.length; i++) {
      try {
        const imgRes = await axios.get(urls[i], { responseType: "arraybuffer", timeout: 10000 });
        const filePath = path.join(folderPath, `pin_${senderID}_${i}_${Date.now()}.jpg`);
        fs.writeFileSync(filePath, imgRes.data);
        filePaths.push(filePath);
        attachments.push(fs.createReadStream(filePath));
      } catch (err) {
        // Ignore individual broken links
      }
    }

    if (!attachments.length) {
      return api.sendMessage("⌀ ꜰᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴀᴅ ɪᴍᴀɢᴇꜱ", threadID, messageID);
    }

    api.sendMessage(
      {
        body: `✦ ᴘɪɴᴛᴇʀᴇꜱᴛ: "${query}"\n◈ ꜱʜᴏᴡɪɴɢ ${attachments.length}/${allImageUrls.length} ɪᴍᴀɢᴇꜱ${random ? " (ʀᴀɴᴅᴏᴍ)" : ""}`,
        attachment: attachments
      },
      threadID,
      () => {
        filePaths.forEach(file => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      },
      messageID
    );

  } catch (error) {
    if (waitMsg && waitMsg.messageID) {
      api.unsend(waitMsg.messageID).catch(() => {});
    }
    return api.sendMessage("⌀ ꜱᴇʀᴠᴇʀ ᴏꜰꜰʟɪɴᴇ ᴏʀ ᴇʀʀᴏʀ", threadID, messageID);
  }
};
