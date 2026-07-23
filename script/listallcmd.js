module.exports.config = {
  name: "listallcmd",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["allcmd", "commandes"],
  description: "Afficher la liste de toutes les commandes disponibles sur le bot",
  usage: "{pn}",
  credits: "kshitiz / Hassan (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event, prefix }) {
  const { threadID, messageID } = event;

  try {
    // Récupération de la liste de toutes les commandes chargées dans le bot
    const allCommands = Array.from(global.GoatBot?.commands?.keys() || global.client?.commands?.keys() || []);

    if (allCommands.length === 0) {
      return api.sendMessage("⚠️ Aucune commande n'a été trouvée ou chargée.", threadID, messageID);
    }

    // Tri par ordre alphabétique
    allCommands.sort();

    // Formatage propre avec de vrais caractères en gras
    const formattedList = allCommands
      .map((cmd, index) => `${index + 1}. ${prefix}${cmd}`)
      .join("\n");

    const message = `📋 𝗟𝗶𝘀𝘁𝗲 𝗱𝗲𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝗲𝘀 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀 (${allCommands.length}) :\n\n` +
      `${formattedList}\n\n` +
      `💡 𝗧𝗶𝗽 : Tapez ${prefix}help <nom_commande> pour plus de détails.`;

    return api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("Erreur listallcmd:", error);
    return api.sendMessage("❌ Une erreur est survenue lors de la récupération des commandes.", threadID, messageID);
  }
};
