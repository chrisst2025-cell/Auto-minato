const axios = require("axios");
const FormData = require("form-data");

const IMGBB_API_KEY = "a0bcf5603cef298e99236e6f0bab90b2";

module.exports.config = {
  name: "imgbb",
  version: "2.0",
  role: 0,
  hasPrefix: true,
  aliases: ["upload"],
  description: "Upload replied image to ImgBB and get direct link",
  usage: "imgbb [reply to image]",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  try {
    const attachments = messageReply?.attachments;

    if (!attachments || attachments.length === 0) {
      return api.sendMessage("❌ Please reply to an image.", threadID, messageID);
    }

    if (attachments[0].type !== "photo") {
      return api.sendMessage("❌ Only photo attachments are supported.", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const imageUrl = attachments[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imageResponse.data);

    const form = new FormData();
    form.append("image", imageBuffer.toString("base64"));
    form.append("key", IMGBB_API_KEY);

    const uploadResponse = await axios.post("https://api.imgbb.com/1/upload", form, {
      headers: form.getHeaders()
    });

    const result = uploadResponse.data;

    if (result.success) {
      const { url } = result.data;
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(url, threadID, messageID);
    } else {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Upload failed. Please try again.", threadID, messageID);
    }

  } catch (error) {
    console.error("ImgBB Error:", error.message);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ Something went wrong. Please try again.", threadID, messageID);
  }
};
