const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const jimp = require("jimp");

const fontsPath = path.join(__dirname, "cache", "Play-Bold.ttf");
const downfonts = "https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download";

module.exports.config = {
  name: "cardinfo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["fbcard", "infocard"],
  description: "Générer une carte d'information au style profil Facebook",
  usage: "{pn} [Nom] [Genre] [Abonnés] [Relation] [Date de naissance] [Lieu] [Lien]",
  credits: "kshitiz (adapté par Chris)",
  cooldown: 5
};

async function circle(imagePath) {
  const img = await jimp.read(imagePath);
  img.circle();
  return await img.getBufferAsync(jimp.MIME_PNG);
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply } = event;

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const pathImg = path.join(cacheDir, `card_${Date.now()}.png`);
  const pathAvatar = path.join(cacheDir, `avatar_${Date.now()}.png`);

  try {
    api.sendMessage("🎨 Génération de votre carte d'information en cours...", threadID, messageID);

    let uid = senderID;
    if (messageReply && messageReply.senderID) {
      uid = messageReply.senderID;
    }

    // Téléchargement de la police d'écriture si elle n'existe pas
    if (!fs.existsSync(fontsPath)) {
      const fontBuffer = (await axios.get(downfonts, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(fontsPath, Buffer.from(fontBuffer));
    }

    // Récupération des informations utilisateur via l'API
    let userInfo = {};
    try {
      const info = await api.getUserInfo(uid);
      userInfo = info[uid] || {};
    } catch (_) {}

    // Récupération de l'avatar et de l'image de fond
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const bgUrl = "https://i.ibb.co/RybN9XR/image.jpg";

    const avatarBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
    const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(pathAvatar, Buffer.from(avatarBuffer));
    const roundedAvatarBuffer = await circle(pathAvatar);

    fs.writeFileSync(pathImg, Buffer.from(bgBuffer));

    // Préparation Canvas
    const baseImage = await loadImage(pathImg);
    const baseAvatar = await loadImage(roundedAvatarBuffer);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvatar, 80, 73, 285, 285);

    // Extraction ou fallback des données
    const name = userInfo.name || args[0] || "Non spécifié";
    const gender = userInfo.gender === 2 ? "Homme" : userInfo.gender === 1 ? "Femme" : args[1] || "Non spécifié";
    const follow = args[2] || "Non spécifié";
    const love = args[3] || "Non spécifié";
    const birthday = args[4] || "Non spécifié";
    const location = args[5] || "Non spécifié";
    const link = args[6] || `https://facebook.com/${uid}`;

    registerFont(fontsPath, { family: "Play-Bold" });

    ctx.font = "28px Play-Bold";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    ctx.fillText(`${name}`, 480, 166);
    ctx.fillText(`${gender}`, 550, 208);
    ctx.fillText(`${follow}`, 550, 244);
    ctx.fillText(`${love}`, 550, 281);
    ctx.fillText(`${birthday}`, 550, 320);
    ctx.fillText(`${location}`, 550, 357);
    ctx.fillText(`${uid}`, 550, 396);

    ctx.font = "20px Play-Bold";
    ctx.fillText(`${link}`, 154, 465);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalBuffer);

    if (fs.existsSync(pathAvatar)) fs.unlinkSync(pathAvatar);

    return api.sendMessage(
      {
        body: `💳 Carte de profil générée pour ${name} !`,
        attachment: fs.createReadStream(pathImg)
      },
      threadID,
      () => {
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      },
      messageID
    );

  } catch (error) {
    console.error("Erreur cardinfo:", error);
    if (fs.existsSync(pathAvatar)) fs.unlinkSync(pathAvatar);
    if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);

    return api.sendMessage("❌ Une erreur est survenue lors de la création de la carte.", threadID, messageID);
  }
};
