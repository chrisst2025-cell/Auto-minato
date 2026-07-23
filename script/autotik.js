const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Stockage de l'état (ON/OFF) pour chaque groupe
const threadStates = {};

module.exports.config = {
  name: "autotik",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["autotiktok"],
  description: "Activer ou désactiver le téléchargement automatique des vidéos TikTok envoyées dans le chat",
  usage: "{pn} [on | off]",
  credits: "Kshitiz / Cliff (adapté par Chris)",
  cooldown: 5
};

// Commande de configuration (on / off)
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!threadStates[threadID]) {
    threadStates[threadID] = { autoTikEnabled: false };
  }

  const option = args[0]?.toLowerCase();

  if (option === "on") {
    threadStates[threadID].autoTikEnabled = true;
    return api.sendMessage("✅ AutoTik est désormais **ACTIVÉ** pour ce groupe.", threadID, messageID);
  } else if (option === "off") {
    threadStates[threadID].autoTikEnabled = false;
    return api.sendMessage("❌ AutoTik est désormais **DÉSACTIVÉ** pour ce groupe.", threadID, messageID);
  } else {
    return api.sendMessage(
      "⚠️ Utilisation :\n- Envoyez `autotik on` pour l'activer\n- Envoyez `autotik off` pour le désactiver",
      threadID,
      messageID
    );
  }
};

// Écoute des liens TikTok partagés dans la discussion
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;

  if (!body || !threadStates[threadID]?.autoTikEnabled) return;

  // Vérification de la présence d'un lien TikTok dans le message
  const tiktokRegex = /(https?:\/\/(?:www\.|v[tm]\.|vm\.)?tiktok\.com\/[^\s]+)/i;
  const match = body.match(tiktokRegex);

  if (!match) return;

  const url = match[0];

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);

    // Extraction du lien de téléchargement via l'API
    const apiRes = await axios.get(`https://api.nayan-project.repl.co/tiktok/downloadvideo?url=${encodeURIComponent(url)}`);
    const videoUrl = apiRes.data?.data?.play;

    if (!videoUrl) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return;
    }

    // Répertoire temporaire
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);

    // Téléchargement de la vidéo
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        fs.unlinkSync(filePath);
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        return api.sendMessage("⚠️ La vidéo est trop lourde (> 25MB) pour être envoyée sur Messenger.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        {
          body: "🎬 Voici la vidéo TikTok !",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("Erreur d'écriture du fichier:", err);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("Erreur AutoTik:", error.message);
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};

