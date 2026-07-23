module.exports.config = {
  name: "notification",
  version: "1.7",
  role: 2,
  hasPrefix: true,
  aliases: ["notify", "noti"],
  description: "Envoyer une notification de l'admin à toutes les conversations",
  usage: "{pn} <message>",
  credits: "NTKhang (adapté par Chris)",
  cooldown: 5,
  envConfig: {
    delayPerGroup: 250
  }
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID, messageReply, attachments } = event;

  const content = args.join(" ");
  const hasAttachments = (attachments && attachments.length > 0) || (messageReply && messageReply.attachments && messageReply.attachments.length > 0);

  if (!content && !hasAttachments) {
    return api.sendMessage(
      `⚠️ Veuillez entrer le message à diffuser.\nExemple : ${prefix}notification Bonjour à tous !`,
      threadID,
      messageID
    );
  }

  // Récupération de toutes les conversations actives du bot
  api.getThreadList(100, null, ["INBOX"], async (err, list) => {
    if (err) {
      return api.sendMessage("❌ Erreur lors de la récupération des groupes.", threadID, messageID);
    }

    const allThreadID = list.filter(item => item.isGroup && item.threadID);
    api.sendMessage(`🚀 Début de l'envoi de la notification vers ${allThreadID.length} groupes...`, threadID, messageID);

    let sendSuccess = 0;
    let sendError = 0;

    const notificationBody = 
      `╭── 📢 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗔𝗗𝗠𝗜𝗡 ──⭓\n` +
      `│ ${content || "Pièce jointe du créateur"}\n` +
      `╰────────────────────⭓`;

    for (const thread of allThreadID) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        await api.sendMessage(notificationBody, thread.threadID);
        sendSuccess++;
      } catch (e) {
        sendError++;
      }
    }

    return api.sendMessage(
      `✅ Diffusion terminée !\n- Succès : ${sendSuccess}\n- Échecs : ${sendError}`,
      threadID,
      messageID
    );
  });
};

