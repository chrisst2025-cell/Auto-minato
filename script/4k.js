const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "4k",
  version: "1.7",
  role: 0,
  hasPrefix: true,
  aliases: ["remini", "hd"],
  description: "Enhance or restore image quality using 4k AI",
  usage: "4k [url] | [reply to image] 4k",
  credits: "Chris st",
  cooldown: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  // Verification de l'auteur (Chris st)
  const requiredAuthor = "Chris st";
  if (module.exports.config.credits !== requiredAuthor) {
    return api.sendMessage("You are not authorized to change the author name.", threadID, messageID);
  }

  const startTime = Date.now();
  let imgUrl;

  if (messageReply && messageReply.attachments && messageReply.attachments[0] && messageReply.attachments[0].type === "photo") {
    imgUrl = messageReply.attachments[0].url;
  } else if (args[0]) {
    imgUrl = args.join(" ");
  }

  if (!imgUrl) {
    return api.sendMessage("Please reply to an image or provide an image URL.", threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  let waitMsgInfo;
  try {
    waitMsgInfo = await new Promise((resolve) => {
      api.sendMessage("𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞... 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 ⏳", threadID, (err, info) => {
        resolve(info);
      }, messageID);
    });

    const baseUrl = await mahmud();
    const apiUrl = `${baseUrl}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;

    const res = await axios.get(apiUrl, { responseType: "stream" });

    if (waitMsgInfo && waitMsgInfo.messageID) {
      api.unsendMessage(waitMsgInfo.messageID);
    }

    api.setMessageReaction("✅", messageID, () => {}, true);

    const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return api.sendMessage({
      body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 (Processed in ${processTime}s)`,
      attachment: res.data
    }, threadID, messageID);

  } catch (error) {
    console.error("4k command error:", error);

    if (waitMsgInfo && waitMsgInfo.messageID) {
      api.unsendMessage(waitMsgInfo.messageID);
    }

    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("🥹 An error occurred while enhancing the image. Please try again later.", threadID, messageID);
  }
};
