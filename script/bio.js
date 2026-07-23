module.exports.config = {
  name: "bio",
  version: "1.7.0",
  role: 2, // Réservé aux administrateurs du bot
  hasPrefix: true,
  aliases: ["setbio", "changebio"],
  description: "Changer la biographie du profil du bot",
  usage: "{pn} <texte>",
  credits: "xemon (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID } = event;
  const newBio = args.join(" ");

  if (!newBio) {
    return api.sendMessage(
      `⚠️ Veuillez fournir un texte pour la nouvelle biographie.\nExemple : ${prefix}bio Bot officiel activé 🤖`,
      threadID,
      messageID
    );
  }

  try {
    api.changeBio(newBio, (err) => {
      if (err) {
        return api.sendMessage(`❌ Erreur lors du changement de biographie : ${err.message || err}`, threadID, messageID);
      }
      return api.sendMessage(`✅ La biographie du bot a été modifiée en :\n"${newBio}"`, threadID, messageID);
    });
  } catch (error) {
    return api.sendMessage(`❌ Une erreur est survenue : ${error.message || error}`, threadID, messageID);
  }
};

