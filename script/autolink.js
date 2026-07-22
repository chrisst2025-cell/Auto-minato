const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

module.exports.config = {
  name: "autolink",
  version: "1.3",
  role: 0,
  hasPrefix: false,
  description: "Auto-download & send videos silently when a link is sent",
  usage: "Auto-detects video URLs in chat",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  // Pas d'action spécifique en commande directe, fonctionne via handleEvent
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  const message = body || "";

  const linkMatches = message.match(/(https?:\/\/[^\s]+)/g);
  if (!linkMatches || linkMatches.length === 0) return;

  const uniqueLinks = [...new Set(linkMatches)];

  api.setMessageReaction("⏳", messageID, () => {}, true);

  let successCount = 0;
  let failCount = 0;

  for (const url of uniqueLinks) {
    try {
      const { title, filePath } = await downloadVideo(url);
      if (!filePath || !fs.existsSync(filePath)) throw new Error("File not found");

      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        fs.unlinkSync(filePath);
        failCount++;
        continue;
      }

      await api.sendMessage(
        {
          body:
`📥 ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ  
━━━━━━━━━━━━━━━  
🎬 ᴛɪᴛʟᴇ: ${title || "Video File"}  
📦 sɪᴢᴇ: ${fileSizeInMB.toFixed(2)} MB  
━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      );

      successCount++;

    } catch (err) {
      failCount++;
    }
  }

  const finalReaction =
    successCount > 0 && failCount === 0 ? "✅" :
    successCount > 0 ? "⚠️" : "❌";

  api.setMessageReaction(finalReaction, messageID, () => {}, true);
};

