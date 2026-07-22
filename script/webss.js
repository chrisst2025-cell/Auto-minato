const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "webss",
  version: "1.1",
  role: 2,
  hasPrefix: true,
  aliases: ["screenshot", "ss"],
  description: "Take a screenshot of any website",
  usage: "webss <url>",
  credits: "Chris st",
  cooldown: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("⚠️ Please provide a URL!\n\nExample: webss mariasmm.shop", threadID, messageID);
  }

  let url = args[0].trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
  } catch {
    return api.sendMessage("❌ Invalid URL!\nExample: webss mariasmm.shop", threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const tmpDir = path.join(__dirname, "cache");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const screenshotPath = path.join(tmpDir, `webss_${Date.now()}.png`);

  try {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://s.wordpress.com/mshots/v1/${encodedUrl}?w=1280&h=800`;

    let imageBuffer;
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      const buffer = Buffer.from(response.data);
      const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

      if (!isGif && buffer.length > 5000) {
        imageBuffer = buffer;
        break;
      }

      await new Promise((r) => setTimeout(r, 4000));
    }

    if (!imageBuffer) throw new Error("Screenshot not ready, try again later");

    await fs.outputFile(screenshotPath, imageBuffer);
    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage(
      {
        body: `✅ Screenshot ready!\n🌐 ${url}`,
        attachment: fs.createReadStream(screenshotPath)
      },
      threadID,
      () => {
        setTimeout(() => {
          fs.remove(screenshotPath).catch(() => {});
        }, 10000);
      },
      messageID
    );

  } catch (err) {
    console.error("Webss error:", err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`❌ Failed to take screenshot!\n\nError: ${err.message}`, threadID, messageID);
  }
};

