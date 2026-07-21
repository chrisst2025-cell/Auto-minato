const axios = require("axios");

module.exports.config = {
  name: "allmember",
  version: "1.0.1",
  role: 0,
  credits: "Chris st",
  description: "Compte tous les membres du groupe actuel, affiche leurs noms et éventuellement le nom et l'image du groupe.",
  commandCategory: "Group Chat",
  usages: "",
  cooldowns: 0,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  try {
    // Obtenir les informations du groupe actuel
    const groupInfo = await api.getThreadInfo(event.threadID);

    if (!groupInfo) {
      api.sendMessage("𝙶𝚛𝚘𝚞𝚙𝚎 𝚒𝚗𝚟𝚊𝚕𝚒𝚍𝚎. 𝚅𝚎𝚞𝚒𝚕𝚕𝚎𝚣 𝚛𝚎́𝚎𝚜𝚜𝚊𝚢𝚎𝚛 𝚙𝚕𝚞𝚜 𝚝𝚊𝚛𝚍.", event.threadID, event.messageID);
      return;
    }

    // Compter le nombre de membres
    const memberCount = groupInfo.participantIDs.length;

    // Obtenir l'image du groupe si elle existe
    let groupPicture;
    if (groupInfo.imageSrc) {
      groupPicture = groupInfo.imageSrc;
    }

    // Préparer le message avec la police Monospace
    const groupName = groupInfo.threadName || "𝚂𝚊𝚗𝚜 𝚗𝚘𝚖";
    const message = `𝙽𝚘𝚖 𝚍𝚞 𝚐𝚛𝚘𝚞𝚙𝚎 : ${groupName}\n\n𝙽𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚖𝚎𝚖𝚋𝚛𝚎𝚜 : ${memberCount}${groupPicture ? `\n𝙸𝚖𝚊𝚐𝚎 𝚍𝚞 𝚐𝚛𝚘𝚞𝚙𝚎 : ${groupPicture}` : ''}`;
    
    api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    console.error("Erreur lors du comptage des membres du groupe :", error);
    api.sendMessage("𝚄𝚗𝚎 𝚎𝚛𝚛𝚎𝚞𝚛 𝚎𝚜𝚝 𝚜𝚞𝚛𝚟𝚎𝚗𝚞𝚎 𝚕𝚘𝚛𝚜 𝚍𝚞 𝚌𝚘𝚖𝚙𝚝𝚊𝚐𝚎 𝚍𝚎𝚜 𝚖𝚎𝚖𝚋𝚛𝚎𝚜.\n𝚅𝚎𝚞𝚒𝚕𝚕𝚎𝚣 𝚛𝚎́𝚎𝚜𝚜𝚊𝚢𝚎𝚛 𝚙𝚕𝚞𝚜 𝚝𝚊𝚛𝚍.", event.threadID, event.messageID);
  }
};
