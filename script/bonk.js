const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "bonk",
  version: "1.2.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Mème Bonk avec les photos de profil (l'expéditeur tient le bâton)",
  usage: "{pn} @mention / réponse à un message",
  credits: "SIFAT (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  try {
    let targetID;

    // Détermination de la cible (mention ou réponse)
    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      targetID = senderID;
    }

    // Récupération des noms
    let name1 = "Quelqu'un";
    let name2 = "Quelqu'un";

    try {
      const userInfo = await api.getUserInfo([senderID, targetID]);
      name1 = userInfo[senderID]?.name || "Quelqu'un";
      name2 = userInfo[targetID]?.name || "Quelqu'un";
    } catch (_) {}

    // URLs des avatars
    const avatar1Url = `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2Url = `https://graph.facebook.com/${targetID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    const imgUrl = `https://maybexenos.vercel.app/meme/bonk?avatar1=${encodeURIComponent(avatar2Url)}&avatar2=${encodeURIComponent(avatar1Url)}`;

    // Téléchargement de l'image générée
    const res = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 15000 });
    
    const folderPath = path.join(__dirname, "cache");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `bonk_${senderID}_${Date.now()}.png`);
    fs.writeFileSync(filePath, res.data);

    return api.sendMessage(
      {
        body: `😂 ${name1} a bonké ${name2} !`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      },
      messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ Une erreur est survenue lors de la création du mème 😿",
      threadID,
      messageID
    );
  }
};

