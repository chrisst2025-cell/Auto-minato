const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "1.0",
  role: 0,
  hasPrefix: true,
  aliases: ["pin", "pint"],
  description: "Search Pinterest and get image results",
  usage: "pinterest <keyword>",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("❗ Please provide a search keyword.\nExample: pinterest Naruto", threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  try {
    const count = 5;
    const url = `https://betadash-api-swordslush-production.up.railway.app/pinterest?search=${encodeURIComponent(query)}&count=${count}`;
    const res = await axios.get(url);

    const imageList = res.data?.data;
    if (!Array.isArray(imageList) || imageList.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ No results found!", threadID, messageID);
    }

    const attachments = [];
    const downloadedPaths = [];

    for (let i = 0; i < imageList.length; i++) {
      try {
        const imageRes = await axios.get(imageList[i], { responseType: "arraybuffer" });
        const imagePath = path.join(cacheDir, `pin_${Date.now()}_${i}.jpg`);
        fs.writeFileSync(imagePath, Buffer.from(imageRes.data));
        downloadedPaths.push(imagePath);
        attachments.push(fs.createReadStream(imagePath));
      } catch (e) {
        console.error(`Failed to download image ${i}:`, e);
      }
    }

    if (attachments.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Failed to download images.", threadID, messageID);
    }

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage(
      {
        body: `🔍 Pinterest results for: "${query}"`,
        attachment: attachments
      },
      threadID,
      () => {
        downloadedPaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      },
      messageID
    );

  } catch (err) {
    console.error("Pinterest error:", err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("🚫 Error fetching from Pinterest API.", threadID, messageID);
  }
};
