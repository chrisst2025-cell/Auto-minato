const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Liste des UIDs des propriétaires du bot (Owner)
const adminUIDs = ["61568806302361"];
const base = "https://tawsif.is-a.dev/save-text/upload";

module.exports.config = {
  name: "savetext",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["save"],
  description: "Uploader du texte ou le contenu d'un fichier JS sur un serveur distant",
  usage: "{pn} <nom_du_fichier.js> ou réponse à un message",
  credits: "Tawsif~ (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID, senderID, messageReply } = event;

  let txt = "";
  let cmd = "";

  // 1. Si l'utilisateur N'EST PAS dans la liste des admins
  if (!adminUIDs.includes(senderID)) {
    if (args.length === 0) {
      if (!messageReply || !messageReply.body) {
        return api.sendMessage("⚠️ Veuillez entrer du texte ou répondre à un message.", threadID, messageID);
      }
      txt = messageReply.body;
    } else {
      txt = args.join(" ");
    }

    try {
      const { data } = await axios.post(base, txt, {
        headers: { "Content-Type": "text/plain" }
      });

      if (!data?.success) {
        return api.sendMessage("❌ Une erreur est survenue lors de l'hébergement du texte.", threadID, messageID);
      }

      return api.sendMessage(`📄 Lien de ton texte :\n${data.fileUrl}`, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`❌ Erreur : ${e.message}`, threadID, messageID);
    }
  }

  // 2. Si l'utilisateur EST administrateur (lecture d'un fichier local)
  let fileName = args[0];

  if (!fileName) {
    if (!messageReply || !messageReply.body) {
      return api.sendMessage("⚠️ Le nom du fichier est requis.", threadID, messageID);
    }
    cmd = messageReply.body;
  } else {
    if (!fileName.endsWith(".js")) {
      fileName += ".js";
    }

    const filePath = path.join(__dirname, fileName);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ Le fichier "${fileName}" n'existe pas dans le dossier des commandes.`, threadID, messageID);
    }

    cmd = fs.readFileSync(filePath, "utf8");
  }

  try {
    const { data } = await axios.post(base, cmd, {
      headers: { "Content-Type": "text/plain" }
    });

    if (!data?.success) {
      return api.sendMessage("❌ Une erreur est survenue lors de l'envoi du fichier.", threadID, messageID);
    }

    return api.sendMessage(`📄 Fichier uploadé avec succès :\n${data.fileUrl}`, threadID, messageID);
  } catch (e) {
    return api.sendMessage(`❌ Erreur : ${e.message}`, threadID, messageID);
  }
};

